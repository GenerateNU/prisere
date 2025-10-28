import { describe, test, expect, beforeEach, mock, afterEach } from "bun:test";
import { DataSource } from "typeorm";
import { S3Service } from "../../modules/s3/service";
import sharp from "sharp";
import UserSeeder from "../../database/seeds/user.seed";
import { User } from "../../entities/User";
import { startTestApp } from "../setup-tests";
import { SeederFactoryManager } from "typeorm-extension";
import { PutObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import CompanySeeder from "../../database/seeds/company.seed";

describe("S3 Client", () => {
    let dataSource: DataSource;
    let s3Service: S3Service;
    let mockSend: ReturnType<typeof mock>;
    let testImageBuffer: Buffer;
    let testPdfBuffer: Buffer;
    let testUsers: User[];

    beforeEach(async () => {
        const testAppData = await startTestApp();
        dataSource = testAppData.dataSource;
        s3Service = new S3Service();

        // Mock S3 send method to handle different commands
        mockSend = mock((command) => {
            if (command instanceof PutObjectCommand) {
                // Mock successful upload
                return Promise.resolve({
                    ETag: '"mock-etag-123"',
                    VersionId: "mock-version-id",
                });
            }
            if (command instanceof ListObjectsV2Command) {
                // Mock no existing files (for duplicate check)
                return Promise.resolve({
                    Contents: [],
                });
            }
            if (command instanceof HeadObjectCommand) {
                // Mock metadata retrieval
                return Promise.resolve({
                    Metadata: {},
                });
            }
            return Promise.resolve({});
        });

        s3Service["client"].send = mockSend;

        const companySeed = new CompanySeeder();
        await companySeed.run(dataSource, {} as SeederFactoryManager);

        const userSeed = new UserSeeder();
        await userSeed.run(dataSource, {} as SeederFactoryManager);

        // Get seeded users
        const userRepo = dataSource.getRepository(User);
        testUsers = await userRepo.find();

        // Generate a simple test image (100x100 red square)
        testImageBuffer = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 0, b: 0 },
            },
        })
            .png()
            .toBuffer();

        // Generate a minimal valid PDF
        testPdfBuffer = Buffer.from(
            "%PDF-1.4\n" +
                "1 0 obj\n" +
                "<< /Type /Catalog /Pages 2 0 R >>\n" +
                "endobj\n" +
                "2 0 obj\n" +
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n" +
                "endobj\n" +
                "3 0 obj\n" +
                "<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\n" +
                "endobj\n" +
                "4 0 obj\n" +
                "<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>\n" +
                "endobj\n" +
                "5 0 obj\n" +
                "<< /Length 44 >>\n" +
                "stream\n" +
                "BT /F1 24 Tf 100 700 Td (Test PDF) Tj ET\n" +
                "endstream\n" +
                "endobj\n" +
                "xref\n" +
                "0 6\n" +
                "0000000000 65535 f\n" +
                "0000000009 00000 n\n" +
                "0000000058 00000 n\n" +
                "0000000115 00000 n\n" +
                "0000000214 00000 n\n" +
                "0000000304 00000 n\n" +
                "trailer\n" +
                "<< /Size 6 /Root 1 0 R >>\n" +
                "startxref\n" +
                "408\n" +
                "%%EOF"
        );
    });

    afterEach(() => {
        mockSend.mockClear();
    });

    // const bucketName = OBJECTS_STORAGE_BUCKET_NAME ? OBJECTS_STORAGE_BUCKET_NAME : 'prisere-objects-storage';

    test("should upload profile image successfully", async () => {
        // Arrange
        const testUser = testUsers[0];
        expect(testUser).toBeDefined();
        expect(testUser.id).toBeDefined();

        // Act
        const result = await s3Service.uploadImage({
            userId: testUser.id,
            imageBuffer: testImageBuffer,
            imageType: "profile",
        });

        // Assert
        expect(result).toBeDefined();
        expect(result.key).toBe(`images/${testUser.id}/profile.webp`);
        expect(result.url).toBeDefined();
        expect(result.size).toBeGreaterThan(0);
        expect(result.hash).toBeDefined();
        expect(result.isDuplicate).toBeUndefined(); // No duplicate on first upload

        // Verify S3 client was called
        expect(mockSend).toHaveBeenCalled();

        // Verify the correct commands were sent
        const calls = mockSend.mock.calls;
        const putObjectCall = calls.find((call) => call[0] instanceof PutObjectCommand);
        expect(putObjectCall).toBeDefined();
    });

    test("should upload custom image with custom imageId", async () => {
        // Arrange
        const testUser = testUsers[0];
        const customImageId = "business-logo";

        // Act
        const result = await s3Service.uploadImage({
            userId: testUser.id,
            imageBuffer: testImageBuffer,
            imageType: "other",
            imageId: customImageId,
        });

        // Assert
        expect(result.key).toBe(`images/${testUser.id}/${customImageId}.webp`);
        expect(result.url).toBeDefined();
        expect(result.size).toBeGreaterThan(0);
    });

    test("should compress image to WebP format", async () => {
        // Arrange
        const testUser = testUsers[0];
        const originalSize = testImageBuffer.length;

        // Act
        const result = await s3Service.uploadImage({
            userId: testUser.id,
            imageBuffer: testImageBuffer,
            imageType: "profile",
        });

        // Assert
        // WebP should be smaller than original PNG for most images
        expect(result.size).toBeLessThanOrEqual(originalSize);

        // Verify the key ends with .webp
        expect(result.key).toMatch(/\.webp$/);
    });

    test("should detect duplicate images", async () => {
        // Arrange
        const testUser = testUsers[0];

        // Mock finding a duplicate on second upload
        let uploadCount = 0;
        mockSend = mock(async (command) => {
            if (command instanceof ListObjectsV2Command) {
                uploadCount++;
                if (uploadCount > 1) {
                    // Second time, return existing file
                    return Promise.resolve({
                        Contents: [
                            {
                                Key: `images/${testUser.id}/profile.webp`,
                                Size: 1000,
                                LastModified: new Date(),
                            },
                        ],
                    });
                }
                return Promise.resolve({ Contents: [] });
            }
            if (command instanceof HeadObjectCommand && uploadCount > 1) {
                // Return matching hash for duplicate
                const hash = s3Service["generateHash"](await sharp(testImageBuffer).webp({ quality: 85 }).toBuffer());
                return Promise.resolve({
                    Metadata: { hash },
                });
            }
            if (command instanceof PutObjectCommand) {
                return Promise.resolve({ ETag: '"mock-etag"' });
            }
            return Promise.resolve({});
        });
        s3Service["client"].send = mockSend;

        // Act - First upload
        await s3Service.uploadImage({
            userId: testUser.id,
            imageBuffer: testImageBuffer,
            imageType: "profile",
        });

        // Act - Second upload (duplicate)
        const result = await s3Service.uploadImage({
            userId: testUser.id,
            imageBuffer: testImageBuffer,
            imageType: "profile",
        });

        // Assert
        expect(result.isDuplicate).toBe(true);
        expect(result.duplicateKey).toBeDefined();
    });

    test("should generate unique imageId when not provided", async () => {
        // Arrange
        const testUser = testUsers[0];

        // Act
        const result = await s3Service.uploadImage({
            userId: testUser.id,
            imageBuffer: testImageBuffer,
            imageType: "other",
            // imageId not provided
        });

        // Key should contain timestamp and random string
        const filename = result.key.split("/").pop();
        expect(filename).toMatch(/\d+-[a-z0-9]+\.webp/);
    });

    // test('should handle upload errors gracefully', async () => {
    //     // Arrange
    //     const testUser = testUsers[0];

    //     // Mock an S3 error
    //     mockSend = mock(() => {
    //         return Promise.reject(new Error('S3 upload failed'));
    //     });
    //     s3Service['client'].send = mockSend;

    //     // Act & Assert
    //     expect(s3Service.uploadImage({
    //         userId: testUser.id,
    //         imageBuffer: testImageBuffer,
    //         imageType: 'profile',
    //     })).rejects.toThrow('S3 upload failed');
    // });

    test("should upload PDF for a claim successfully", async () => {
        // Arrange
        const testClaimId = "claim-123";
        const testDocumentId = "damage-report";

        // Act
        const result = await s3Service.uploadPdf({
            claimId: testClaimId,
            pdfBuffer: testPdfBuffer,
            documentId: testDocumentId,
        });

        // Assert
        expect(result).toBeDefined();
        expect(result.key).toBe(`pdfs/${testClaimId}/${testDocumentId}.pdf`);
        expect(result.url).toBeDefined();
        expect(result.size).toBe(testPdfBuffer.length);
        expect(result.hash).toBeDefined();
        expect(result.isDuplicate).toBeUndefined();
    });

    test("should generate documentId when not provided for PDF", async () => {
        // Arrange
        const testClaimId = "claim-456";

        // Act
        const result = await s3Service.uploadPdf({
            claimId: testClaimId,
            pdfBuffer: testPdfBuffer,
            // documentId not provided
        });

        // Assert
        expect(result.key).toMatch(/^pdfs\/claim-456\/\d+-[a-z0-9]+\.pdf$/);
    });
});
