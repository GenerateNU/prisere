import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DocumentTypes, GetUploadUrlResponse, PdfListItem, UploadResult } from "../../types/S3Types";
import { logMessageToFile } from "../../utilities/logger";
import { DataSource } from "typeorm";
import { DocumentCategories, DocumentWithUrl } from "../../types/DocumentType";
import { Document } from "../../entities/Document";
import { IDocumentTransaction } from "../documents/transaction";

const S3_BUCKET_NAME = process.env.OBJECTS_STORAGE_BUCKET_NAME;
const PRESIGNED_URL_EXPIRY = 3600; // 1 hour

export interface IS3Service {
    getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    /**
     * Deletes an object from S3
     * key: requied - path of object to get
     */
    deleteObject(key: string, documentId: string): Promise<void>;
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

    /**
     * Generates a presigned URL for uploading an object to S3. URL expires after the specified time (default: 1 hour)
     * key: required - path where the object will be uploaded
     * contentType: optional - MIME type of the file being uploaded
     * expiresIn: optional - time (in seconds) the URL expires in
     * metadata: optional - custom metadata to attach to the uploaded object
     */
    getPresignedUploadUrl(
        key: string,
        contentType?: string,
        expiresIn?: number,
        metadata?: Record<string, string>
    ): Promise<string>;
    /**
     * Generates a presigned URL for uploading and returns upload details
     */
    getUploadUrl(options: {
        fileName: string;
        fileType: string;
        documentType: DocumentTypes;
        claimId?: string;
        userId?: string;
        companyId: string;
    }): Promise<GetUploadUrlResponse>;

    /**
     * Confirms an upload was successful and returns file details
     */
    confirmUpload(options: {
        key: string;
        documentId: string;
        documentType: DocumentTypes;
        claimId?: string;
        userId: string;
        companyId: string;
        category?: DocumentCategories;
    }): Promise<UploadResult>;

    uploadToS3(uploadUrl: string, file: File): Promise<void>;

    getAllDocuments(
        documentType: DocumentTypes,
        companyId?: string,
        userId?: string
    ): Promise<DocumentWithUrl[] | null>;

    updateDocumentCategory(documentId: string, category: DocumentCategories): Promise<void>;
}

export class S3Service implements IS3Service {
    private client: S3Client;
    private bucketName: string | undefined; // undefined if not in env vars
    private db: DataSource;
    private documentTransaction: IDocumentTransaction;

    constructor(db: DataSource, documentTransaction: IDocumentTransaction) {
        this.db = db;
        this.documentTransaction = documentTransaction;
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
        if (S3_BUCKET_NAME) {
            this.bucketName = S3_BUCKET_NAME;
        } else {
            console.error("Please define OBJECTS_STORAGE_BUCKET_NAME in .env");
        }
    }

    async getPresignedUploadUrl(
        key: string,
        contentType?: string,
        expiresIn: number = PRESIGNED_URL_EXPIRY,
        metadata?: Record<string, string>
    ): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
                Metadata: metadata,
                ContentEncoding: 'gzip',
            });

            const url = await getSignedUrl(this.client, command, { expiresIn });
            return url;
        } catch (error) {
            console.error(`Error generating presigned upload URL for ${key}:`, error);
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

    async updateDocumentCategory(documentId: string, category: DocumentCategories): Promise<void> {
        return this.documentTransaction.updateDocumentCategory(documentId, category);
    }

    async getAllDocuments(documentType: DocumentTypes, companyId: string, userId?: string): Promise<DocumentWithUrl[]> {
        try {
            const repository = this.db.getRepository(Document);
            let dbDocuments: Document[];

            if (documentType === DocumentTypes.GENERAL_BUSINESS || documentType === DocumentTypes.CLAIM) {
                dbDocuments = await repository.find({
                    where: { companyId: companyId },
                    relations: ["user", "company", "claim"],
                });
            } else if (documentType === DocumentTypes.IMAGES) {
                dbDocuments = await repository.find({
                    where: { userId: userId },
                    relations: ["user", "company"],
                });
            } else {
                throw new Error(`Unsupported document type: ${documentType}`);
            }

            if (dbDocuments.length === 0) {
                logMessageToFile(`No documents found for type ${documentType}`);
                return [];
            }

            const enrichedDocuments = await Promise.all(
                dbDocuments.map(async (doc) => {
                    try {
                        const downloadUrl = await this.getPresignedDownloadUrl(doc.key);

                        return {
                            document: {
                                id: doc.id,
                                key: doc.key,
                                s3DocumentId: doc.s3DocumentId,
                                category: doc.category,
                                createdAt: doc.createdAt,
                                lastModified: doc.lastModified || null,
                                company: {
                                    id: doc.company.id,
                                    name: doc.company.name,
                                    businessOwnerFullName: doc.company.businessOwnerFullName,
                                    companyType: doc.company.companyType,
                                    createdAt: doc.company.createdAt.toISOString(),
                                    updatedAt: doc.company.updatedAt.toISOString(),
                                    lastQuickBooksInvoiceImportTime:
                                        doc.company.lastQuickBooksInvoiceImportTime?.toISOString() || null,
                                    lastQuickBooksPurchaseImportTime:
                                        doc.company.lastQuickBooksPurchaseImportTime?.toISOString() || null,
                                    alternateEmail: doc.company.alternateEmail,
                                },
                                user: doc.user,
                                claim: doc.claim
                                    ? {
                                          id: doc.claim.id,
                                          status: doc.claim.status,
                                          createdAt: doc.claim.createdAt.toISOString(),
                                          updatedAt: doc.claim.updatedAt?.toISOString(),
                                          femaDisaster: doc.claim.femaDisaster,
                                          selfDisaster: doc.claim.selfDisaster,
                                          insurancePolicy: doc.claim.insurancePolicy,
                                          claimLocations: doc.claim.claimLocations,
                                      }
                                    : undefined,
                            },
                            downloadUrl,
                        } as DocumentWithUrl;
                    } catch (error) {
                        console.error(`Error generating URL for ${doc.key}:`, error);
                        return {
                            document: {
                                id: doc.id,
                                key: doc.key,
                                s3DocumentId: doc.s3DocumentId,
                                category: doc.category,
                                createdAt: doc.createdAt,
                                lastModified: doc.lastModified || null,
                                company: {
                                    id: doc.company.id,
                                    name: doc.company.name,
                                    businessOwnerFullName: doc.company.businessOwnerFullName,
                                    companyType: doc.company.companyType,
                                    createdAt: doc.company.createdAt.toISOString(),
                                    updatedAt: doc.company.updatedAt.toISOString(),
                                    lastQuickBooksInvoiceImportTime:
                                        doc.company.lastQuickBooksInvoiceImportTime?.toISOString() || null,
                                    lastQuickBooksPurchaseImportTime:
                                        doc.company.lastQuickBooksPurchaseImportTime?.toISOString() || null,
                                    alternateEmail: doc.company.alternateEmail,
                                },
                                user: doc.user,
                                claim: doc.claim
                                    ? {
                                          id: doc.claim.id,
                                          status: doc.claim.status,
                                          createdAt: doc.claim.createdAt.toISOString(),
                                          updatedAt: doc.claim.updatedAt?.toISOString(),
                                          femaDisaster: doc.claim.femaDisaster,
                                          selfDisaster: doc.claim.selfDisaster,
                                          insurancePolicy: doc.claim.insurancePolicy,
                                          claimLocations: doc.claim.claimLocations,
                                      }
                                    : undefined,
                            },
                            downloadUrl: "",
                        } as DocumentWithUrl;
                    }
                })
            );

            return enrichedDocuments;
        } catch (error) {
            console.error(`Error getting documents for type ${documentType}:`, error);
            throw error;
        }
    }

    async deleteObject(key: string, documentId: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.client.send(command);
            // Delete from database
            await this.documentTransaction.deleteDocumentRecord(documentId);
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
                logMessageToFile(`No PDF found for claim ${claimId}`);
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

    async getUploadUrl(options: {
        fileName: string;
        fileType: string;
        documentType: DocumentTypes;
        claimId?: string;
        userId?: string;
        companyId: string;
    }): Promise<GetUploadUrlResponse> {
        const { fileName, fileType, documentType, claimId, userId, companyId } = options;

        try {
            // Generate unique document ID
            const documentId = fileName;

            // Determine the S3 key based on document type
            // business-documents, claims, images
            let key: string;
            if (claimId) {
                // For claim-specific documents
                key = `claims/${companyId}/${claimId}/${documentId}`;
            } else if (documentType === DocumentTypes.GENERAL_BUSINESS) {
                // For general business documents
                key = `business-documents/${companyId}/${documentId}`;
            } else {
                key = `images/${userId}/${documentId}`;
            }

            // Prepare metadata, we could remove this
            const metadata: Record<string, string> = {
                companyId,
                documentType,
                originalFilename: fileName,
                uploadedAt: new Date().toISOString(),
            };

            if (claimId) {
                metadata.claimId = claimId;
            }

            // Generate presigned URL
            const uploadUrl = await this.getPresignedUploadUrl(key, fileType, PRESIGNED_URL_EXPIRY, metadata);

            logMessageToFile(`Generated upload URL for: ${key}`);

            return {
                uploadUrl,
                key,
                documentId,
                expiresIn: PRESIGNED_URL_EXPIRY,
            };
        } catch (error) {
            logMessageToFile(`Error generating upload URL: ${error}`);
            throw error;
        }
    }

    async confirmUpload(options: {
        key: string;
        documentId: string;
        documentType: DocumentTypes;
        claimId?: string;
        userId: string;
        companyId: string;
        category?: DocumentCategories;
    }): Promise<UploadResult> {
        const { key, documentId, claimId, userId, companyId, category } = options;

        try {
            // Verify the file exists in S3
            const headCommand = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            const metadata = await this.client.send(headCommand);

            if (!metadata.ContentLength) {
                throw new Error("File not found in S3");
            }
            // Generate download URL
            const url = await this.getPresignedDownloadUrl(key);

            logMessageToFile(`Upload confirmed for: ${key}`);

            this.documentTransaction.upsertDocument({
                key: key,
                downloadUrl: url,
                s3DocumentId: documentId,
                userId: userId,
                companyId: companyId,
                claimId: claimId,
                category: category ?? undefined,
            });

            return {
                key,
                url,
                size: metadata.ContentLength,
                hash: metadata.Metadata?.hash || "",
            };
        } catch (error) {
            logMessageToFile(`Error confirming upload: ${error}`);
            throw error;
        }
    }

    async saveDocument(documentData: Partial<Document>): Promise<Document> {
        const document = await this.db.manager.save(Document, documentData);
        return document;
    }

    async uploadToS3(uploadUrl: string, file: File): Promise<void> {
        const arrayBuffer = await file.arrayBuffer();
        const body = Bun.gzipSync(new Uint8Array(arrayBuffer));

        const headers: HeadersInit = {
            "Content-Type": file.type,
            "Content-Encoding": "gzip"
        };
        const response = await fetch(uploadUrl, {
            method: "PUT",
            body,
            headers,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
    }

    async uploadBufferToS3(uploadUrl: string, file: Buffer): Promise<void> {
        const body = Bun.gzipSync(new Uint8Array(file));
        const headers: HeadersInit = {
            'Content-Encoding': 'gzip',
        };

        const response = await fetch(uploadUrl, {
            method: "PUT",
            body,
            headers,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Upload failed: ${response.status} ${response.statusText}. ${errorText}`
            );
        }
    }
}
