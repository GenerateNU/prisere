import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { createHash } from "crypto";
import { OBJECTS_STORAGE_BUCKET_NAME } from "../../utilities/constants";
import { PdfListItem, UploadImageOptions, UploadPdfOptions, UploadResult } from "../../types/S3Types";
import { logMessageToFile } from "../../utilities/logger";

const S3_BUCKET_NAME = OBJECTS_STORAGE_BUCKET_NAME || "prisere-objects-storage";
const IMAGE_QUALITY = 85; // Compress the image at 85% quality
const PRESIGNED_URL_EXPIRY = 3600; // 1 hour

export interface IS3Service {
    /**
     * Uploads a profile picture or other user image to S3 with automatic WebP compression
     * Profile pictures are stored at /images/{userId}/profile.webp
     * Other images can have custom IDs, Options include:
     * userId: required - (user of the profile picture)
     * imageBuffer: required - image buffer from API endpoint (endpoint should convert from image -> buffer (raw binary data))
     * imageType: optional - purpose of image, default is 'profile'
     * imageId: optional - 'profile' will always be used for profile pic, custom image ID name (generated uuid will be used otherwise)
     */
    uploadImage(options: UploadImageOptions): Promise<UploadResult>;
    /**
     * Uploads a PDF document for a specific claim to S3. PDFs are stored at /pdfs/{claimId}/{documentId}.pdf
     * PDFs are typically already compressed, so no additional compression is applied
     * Options include:
     * claimId: required - ID of claim the PDF is created for
     * pdfBuffer: required - Buffer of PDF to upload
     * documentId: optional - ID to use for document name in S3
     * originalFileName: optional - original file name to use for metadata
     */
    uploadPdf(options: UploadPdfOptions): Promise<UploadResult>;
    /**
     * Generates a presigned URL for downloading an object from S3. URL expires after the specified time (default: 1 hour)
     * key: required - path of object to get presigned URL for
     * expiresIn: optional - time (in seconds) the URL expires in
     */
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    /**
     * Deletes an object from S3
     * key: requied - path of object to get
     */
    deleteObject(key: string): Promise<void>;
    /**
     * Checks if a file with the same hash already exists in the specified prefix
     * Returns the key of the duplicate if found, null otherwise
     * hash - SHA-256 calculated hash of the item to check for duplicates of
     * prefix - folder path before the file name/document ID
     */
    checkDuplicate(hash: string, prefix: string): Promise<string | null>;
    /**
     * Gets the PDF for a specific claim with presigned download URL
     * Returns the most recent version automatically (S3 versioning handles old versions)
     * Returns null if no PDF exists for the claim
     * claimId: required - ID of claim to get the PDF of
     */
    getClaimPdf(claimId: string): Promise<PdfListItem | null>;
}

export class S3Service implements IS3Service {
    private client: S3Client;
    private bucketName: string;

    constructor() {
        const config: any = {
            region: process.env.AWS_REGION || "us-east-1",
        };

        // Provide fake credentials in test environment
        if (process.env.NODE_ENV === "test") {
            config.credentials = {
                accessKeyId: "test-key",
                secretAccessKey: "test-secret",
            };
        }

        this.client = new S3Client(config);
        this.bucketName = S3_BUCKET_NAME;
    }

    async uploadImage(options: UploadImageOptions): Promise<UploadResult> {
        const { userId, imageBuffer, imageType = "profile", imageId } = options;

        try {
            // Compress image to WebP format using sharp library
            const compressedBuffer = await sharp(imageBuffer).webp({ quality: IMAGE_QUALITY }).toBuffer();

            // Generate hash of the buffer for duplicate detection
            const hash = this.generateHash(compressedBuffer);

            // Check for duplicates in user's images folder
            // If object is already found, return this
            const duplicateKey = await this.checkDuplicate(hash, `images/${userId}/`);
            if (duplicateKey) {
                const url = await this.getPresignedDownloadUrl(duplicateKey);
                return {
                    key: duplicateKey,
                    url,
                    size: compressedBuffer.length,
                    hash,
                    isDuplicate: true,
                    duplicateKey,
                };
            }

            // Generate key based on image type (always /profile for profile picture)
            const filename = imageType === "profile" ? "profile.webp" : `${imageId || this.generateUniqueId()}.webp`;
            const key = `images/${userId}/${filename}`;

            // Upload image using AWS SDK S3 client
            await this.uploadToS3(key, compressedBuffer, "image/webp", {
                hash,
                userId,
                imageType,
            });

            const url = await this.getPresignedDownloadUrl(key);

            logMessageToFile(`Successfully uploaded image: ${key}`);
            return {
                key,
                url,
                size: compressedBuffer.length,
                hash,
            };
        } catch (error) {
            //   console.error("Error uploading image:", error);
            logMessageToFile(`Error uploading image: ${error}`);
            throw error;
        }
    }

    async uploadPdf(options: UploadPdfOptions): Promise<UploadResult> {
        const { claimId, pdfBuffer, documentId, originalFilename } = options;

        try {
            // Generate hash for duplicate detection
            const hash = this.generateHash(pdfBuffer);

            // Check for duplicates in claim's pdfs folder
            // If a duplicate already exists, return the existing object
            const duplicateKey = await this.checkDuplicate(hash, `pdfs/${claimId}/`);
            if (duplicateKey) {
                const url = await this.getPresignedDownloadUrl(duplicateKey);
                return {
                    key: duplicateKey,
                    url,
                    size: pdfBuffer.length,
                    hash,
                    isDuplicate: true,
                    duplicateKey,
                };
            }

            // Use provided documentId or generate one
            const docId = documentId || this.generateUniqueId();
            const key = `pdfs/${claimId}/${docId}.pdf`;

            // Upload PDF
            await this.uploadToS3(key, pdfBuffer, "application/pdf", {
                hash,
                claimId,
                originalFilename: originalFilename || "",
            });

            const url = await this.getPresignedDownloadUrl(key);

            logMessageToFile(`Successfully uploaded PDF: ${key}`);
            return {
                key,
                url,
                size: pdfBuffer.length,
                hash,
            };
        } catch (error) {
            console.error("Error uploading PDF:", error);
            throw error;
        }
    }

    async getPresignedDownloadUrl(key: string, expiresIn: number = PRESIGNED_URL_EXPIRY): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            // Use AWS SDK to get the signed URL
            const url = await getSignedUrl(this.client, command, { expiresIn });
            return url;
        } catch (error) {
            console.error(`Error generating presigned URL for ${key}:`, error);
            throw error;
        }
    }

    async deleteObject(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.client.send(command);
            console.log(`Successfully deleted object: ${key}`);
        } catch (error) {
            console.error(`Error deleting object ${key}:`, error);
            throw error;
        }
    }

    async getClaimPdf(claimId: string): Promise<PdfListItem | null> {
        try {
            const prefix = `pdfs/${claimId}/`;

            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: 1, // Only need one result since there's one PDF per claim
            });

            const response = await this.client.send(command);

            if (!response.Contents || response.Contents.length === 0) {
                console.log(`No PDF found for claim ${claimId}`);
                return null;
            }

            const obj = response.Contents[0];

            if (!obj.Key) {
                return null;
            }

            // Extract documentId from key (last part before .pdf)
            const documentId = obj.Key.split("/").pop()?.replace(".pdf", "") || "";

            const pdfItem: PdfListItem = {
                key: obj.Key,
                url: await this.getPresignedDownloadUrl(obj.Key),
                size: obj.Size || 0,
                documentId,
                ...(obj.LastModified && { lastModified: obj.LastModified }),
            };

            return pdfItem;
        } catch (error) {
            console.error(`Error getting PDF for claim ${claimId}:`, error);
            throw error;
        }
    }

    async checkDuplicate(hash: string, prefix: string): Promise<string | null> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
            });

            const response = await this.client.send(command);

            if (!response.Contents) {
                return null;
            }

            // Check each object's metadata for matching hash
            for (const obj of response.Contents) {
                if (!obj.Key) {
                    continue;
                }

                try {
                    const headCommand = new HeadObjectCommand({
                        Bucket: this.bucketName,
                        Key: obj.Key,
                    });
                    const metadata = await this.client.send(headCommand);

                    if (metadata.Metadata?.hash === hash) {
                        logMessageToFile(`Found duplicate: ${obj.Key}`);
                        return obj.Key;
                    }
                } catch (error) {
                    // Continue checking other objects if one fails
                    logMessageToFile(`${error}`);
                    continue;
                }
            }

            return null;
        } catch (error) {
            console.error("Error checking for duplicates:", error);
            // Allow upload to continue even if duplicate check fails
            return null;
        }
    }

    /**
     * Private helper method to upload a buffer to S3
     */
    private async uploadToS3(
        key: string,
        buffer: Buffer,
        contentType: string,
        metadata: Record<string, string>
    ): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            Metadata: metadata,
            // Storage class will change based on access pattern, see s3.tf for more information/lifecycle policy
            StorageClass: "STANDARD",
        });

        await this.client.send(command);
    }

    /**
     * Generates a SHA-256 hash of a buffer for duplicate detection
     */
    private generateHash(buffer: Buffer): string {
        return createHash("sha256").update(buffer).digest("hex");
    }

    /**
     * Generates a unique ID using timestamp and random string
     */
    private generateUniqueId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}
