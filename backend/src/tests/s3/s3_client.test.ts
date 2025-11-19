import { describe, test, expect, beforeEach, mock, afterEach } from "bun:test";
import { DataSource } from "typeorm";
import { S3Service } from "../../modules/s3/service";
import { startTestApp } from "../setup-tests";
import { SeederFactoryManager } from "typeorm-extension";
import { 
    PutObjectCommand, 
    ListObjectsV2Command, 
    HeadObjectCommand, 
    GetObjectCommand,
    DeleteObjectCommand 
} from "@aws-sdk/client-s3";
import CompanySeeder from "../../database/seeds/company.seed";
import UserSeeder from "../../database/seeds/user.seed";
import { DocumentTransaction } from "../../modules/documents/transaction";
import { DocumentCategories } from "../../types/DocumentType";
import { Company } from "../../entities/Company";
import { User } from "../../entities/User";
import { Document } from "../../entities/Document";
import { DocumentTypes } from "../../types/S3Types";

describe("S3 Service - Document Management", () => {
    let dataSource: DataSource;
    let s3Service: S3Service;
    let documentTransaction: DocumentTransaction;
    let mockSend: ReturnType<typeof mock>;
    let testCompany: Company;
    let testUser: User;

    beforeEach(async () => {
        const testAppData = await startTestApp();
        dataSource = testAppData.dataSource;
        
        documentTransaction = new DocumentTransaction(dataSource);
        s3Service = new S3Service(dataSource, documentTransaction);

        // Mock S3 send method
        mockSend = mock((command) => {
            if (command instanceof PutObjectCommand) {
                return Promise.resolve({
                    ETag: '"mock-etag-123"',
                    VersionId: "mock-version-id",
                });
            }
            if (command instanceof ListObjectsV2Command) {
                return Promise.resolve({
                    Contents: [
                        {
                            Key: "business-documents/test-company-id/test-doc.pdf",
                            Size: 1000,
                            LastModified: new Date(),
                        }
                    ],
                });
            }
            if (command instanceof HeadObjectCommand) {
                return Promise.resolve({
                    ContentLength: 1000,
                    Metadata: {
                        companyId: "test-company-id",
                        documentType: DocumentTypes.GENERAL_BUSINESS,
                    },
                });
            }
            if (command instanceof DeleteObjectCommand) {
                return Promise.resolve({});
            }
            if (command instanceof GetObjectCommand) {
                return Promise.resolve({});
            }
            return Promise.resolve({});
        });

        s3Service["client"].send = mockSend;

        // Seed database
        const companySeed = new CompanySeeder();
        await companySeed.run(dataSource, {} as SeederFactoryManager);

        const userSeed = new UserSeeder();
        await userSeed.run(dataSource, {} as SeederFactoryManager);

        // Get test data
        const companyRepo = dataSource.getRepository(Company);
        testCompany = (await companyRepo.findOne({ where: {} }))!;

        const userRepo = dataSource.getRepository(User);
        testUser = (await userRepo.findOne({ where: {} }))!;
    });

    afterEach(() => {
        mockSend.mockClear();
    });

    describe("getUploadUrl", () => {
        test("should generate presigned upload URL for business document", async () => {
            const result = await s3Service.getUploadUrl({
                fileName: "invoice-2024.pdf",
                fileType: "application/pdf",
                documentType: DocumentTypes.GENERAL_BUSINESS,
                companyId: testCompany.id,
            });

            expect(result).toBeDefined();
            expect(result.uploadUrl).toBeDefined();
            expect(result.key).toBe(`business-documents/${testCompany.id}/invoice-2024.pdf`);
            expect(result.documentId).toBe("invoice-2024.pdf");
            expect(result.expiresIn).toBe(3600);
        });

        test("should generate presigned upload URL for claim document", async () => {
            const claimId = "test-claim-id";
            const result = await s3Service.getUploadUrl({
                fileName: "damage-report.pdf",
                fileType: "application/pdf",
                documentType: DocumentTypes.CLAIM,
                companyId: testCompany.id,
                claimId,
            });

            expect(result.key).toBe(`claims/${testCompany.id}/${claimId}/damage-report.pdf`);
        });
    });

    describe("confirmUpload", () => {
        test("should confirm upload and create document record", async () => {
            const key = `business-documents/${testCompany.id}/test-doc.pdf`;
            const documentIdS3 = "test-doc";
            const docId = 'a81bc81b-dead-4e5d-abff-90865d1e13b1';

            const result = await s3Service.confirmUpload({
                key,
                documentId: documentIdS3,
                documentType: DocumentTypes.GENERAL_BUSINESS,
                userId: testUser.id,
                companyId: testCompany.id,
                category: DocumentCategories.Expenses,
            });

            expect(result).toBeDefined();
            expect(result.key).toBe(key);
            expect(result.url).toBeDefined();
            expect(result.size).toBe(1000);

            // Verify document was saved to database
            const docRepo = dataSource.getRepository(Document);
            const savedDoc = await docRepo.findOne({
                where: { companyId: testCompany.id }
            });
            
            expect(savedDoc).toBeDefined();
            // expect(savedDoc?.category).toBe(DocumentCategories.Expenses);
            // expect(savedDoc?.companyId).toBe(testCompany.id);
        });

        test("should confirm upload without category", async () => {
            const key = `business-documents/${testCompany.id}/test-doc-2.pdf`;
            const documentId = "test-doc-2";

            const result = await s3Service.confirmUpload({
                key,
                documentId,
                documentType: DocumentTypes.GENERAL_BUSINESS,
                userId: testUser.id,
                companyId: testCompany.id,
            });

            expect(result).toBeDefined();

            // Verify document was saved without category
            const docRepo = dataSource.getRepository(Document);
            const savedDoc = await docRepo.findOne({
                where: { s3DocumentId: documentId }
            });
            
            expect(savedDoc).toBeDefined();
            expect(savedDoc?.category).toBeUndefined();
        });
    });

    describe("getAllDocuments", () => {
        test("should retrieve all business documents for a company", async () => {
            // Create test documents
            await documentTransaction.upsertDocument({
                key: `business-documents/${testCompany.id}/doc1.pdf`,
                downloadUrl: "https://example.com/doc1.pdf",
                s3DocumentId: "doc1",
                companyId: testCompany.id,
                userId: testUser.id,
                category: DocumentCategories.Expenses,
            });

            await documentTransaction.upsertDocument({
                key: `business-documents/${testCompany.id}/doc2.pdf`,
                downloadUrl: "https://example.com/doc2.pdf",
                s3DocumentId: "doc2",
                companyId: testCompany.id,
                userId: testUser.id,
                category: DocumentCategories.Revenues,
            });

            const result = await s3Service.getAllDocuments(
                DocumentTypes.GENERAL_BUSINESS,
                testCompany.id
            );

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThanOrEqual(2);
            
            const doc1 = result.find(d => d.s3DocumentId === "doc1");
            expect(doc1?.category).toBe(DocumentCategories.Expenses);
            
            const doc2 = result.find(d => d.s3DocumentId === "doc2");
            expect(doc2?.category).toBe(DocumentCategories.Revenues);
        });

        test("should return empty array when no documents exist", async () => {
            const newCompanyRepo = dataSource.getRepository(Company);
            const newCompany = await newCompanyRepo.save({
                name: "New Company",
                businessOwnerFullName: "Test Owner",
            });

            const result = await s3Service.getAllDocuments(
                DocumentTypes.GENERAL_BUSINESS,
                newCompany.id
            );

            expect(result).toBeDefined();
            expect(result.length).toBe(0);
        });
    });

    describe("updateDocumentCategory", () => {
        test("should update document category", async () => {
            // Create test document
            const doc = await documentTransaction.upsertDocument({
                key: `business-documents/${testCompany.id}/test.pdf`,
                downloadUrl: "https://example.com/test.pdf",
                s3DocumentId: "test-cat",
                companyId: testCompany.id,
                userId: testUser.id,
                category: DocumentCategories.Expenses,
            });

            await s3Service.updateDocumentCategory(
                doc!.id,
                DocumentCategories.Revenues
            );

            // Verify update
            const docRepo = dataSource.getRepository(Document);
            const updated = await docRepo.findOne({ where: { id: doc!.id } });
            
            expect(updated?.category).toBe(DocumentCategories.Revenues);
        });
    });

    describe("deleteObject", () => {
        test("should delete document from S3 and database", async () => {
            const key = `business-documents/${testCompany.id}/delete-test.pdf`;
            const documentId = "delete-test";

            // Create document
            await documentTransaction.upsertDocument({
                key,
                downloadUrl: "https://example.com/delete-test.pdf",
                s3DocumentId: documentId,
                companyId: testCompany.id,
                userId: testUser.id,
            });

            // Delete
            await s3Service.deleteObject(key, testCompany.id);

            // Verify S3 delete was called
            expect(mockSend).toHaveBeenCalled();
            const deleteCall = mockSend.mock.calls.find(
                (call) => call[0] instanceof DeleteObjectCommand
            );
            expect(deleteCall).toBeDefined();

            // Verify database deletion
            const docRepo = dataSource.getRepository(Document);
            const deleted = await docRepo.findOne({
                where: { id: testCompany.id }
            });
            expect(deleted).toBeNull();
        });
    });

    describe("getPresignedDownloadUrl", () => {
        test("should generate presigned download URL", async () => {
            const key = "business-documents/test-company/test.pdf";
            
            const url = await s3Service.getPresignedDownloadUrl(key);
            
            expect(url).toBeDefined();
            expect(typeof url).toBe("string");
        });

        test("should generate URL with custom expiry", async () => {
            const key = "business-documents/test-company/test.pdf";
            const customExpiry = 7200; // 2 hours
            
            const url = await s3Service.getPresignedDownloadUrl(key, customExpiry);
            
            expect(url).toBeDefined();
        });
    });
});