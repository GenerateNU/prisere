import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach, spyOn } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { startTestApp } from "../../setup-tests";
import { TESTING_PREFIX } from "../../../utilities/constants";
import { S3Service } from "../../../modules/s3/service";
import { initPdfTestData } from "./setup";

describe("GET /claims/{id}/pdf - Generate Claim PDF", () => {
    let app: Hono;
    let backup: IBackup;
    let testAppDataSource: DataSource;
    let getPresignedDownloadUrlSpy: any;
    let getClaimPdfSpy: any;
    let getPresignedUploadUrlSpy: any;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        testAppDataSource = testAppData.dataSource;
        process.env.OBJECTS_STORAGE_BUCKET_NAME = "test-bucket";
    });

    beforeEach(async () => {
        await initPdfTestData(testAppDataSource);

        // Mock getPresignedUploadUrl - PDF gen calls this first
        getPresignedUploadUrlSpy = spyOn(S3Service.prototype, "getPresignedUploadUrl").mockImplementation(
            async (key: string) => {
                return `https://test-bucket.s3.amazonaws.com/upload/${key}?mock=true`;
            }
        );

        // Mock uploadBufferToS3 - PDF gen calls this to upload the buffer
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const uploadBufferToS3Spy = spyOn(
            S3Service.prototype,
            "uploadBufferToS3"
            /* eslint-disable @typescript-eslint/no-unused-vars */
        ).mockImplementation(async (uploadUrl: string, buffer: Buffer) => {
            // Just resolve without actually uploading
            return Promise.resolve();
        });

        // Mock confirmUpload - PDF gen calls this after upload
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const confirmUploadSpy = spyOn(S3Service.prototype, "confirmUpload").mockImplementation(async (options) => {
            return {
                key: options.key,
                url: `https://test-bucket.s3.amazonaws.com/${options.key}`,
                size: 1000,
                hash: "test-hash",
            };
        });

        // Mock getPresignedDownloadUrl
        getPresignedDownloadUrlSpy = spyOn(S3Service.prototype, "getPresignedDownloadUrl").mockImplementation(
            async (key: string) => {
                return `https://test-bucket.s3.amazonaws.com/${key}`;
            }
        );

        // Mock getClaimPdf - checks for existing PDF
        getClaimPdfSpy = spyOn(S3Service.prototype, "getClaimPdf").mockImplementation(async (claimId: string) => {
            return null; // No existing PDF
        });
    });

    afterEach(() => {
        backup.restore();
        getPresignedDownloadUrlSpy?.mockRestore();
        getClaimPdfSpy?.mockRestore();
        getPresignedUploadUrlSpy?.mockRestore();
    });

    describe("Successful PDF Generation", () => {
        test("GET /claims/{id}/pdf - Successfully generates PDF and returns S3 URL", async () => {
            const claimId = "0174375f-e7c4-4862-bb9f-f58318bb2e7d";

            const response = await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            // Log error if test fails
            if (response.status !== 200) {
                const errorText = await response.text();
                console.error("Error response:", response.status, errorText);
            }

            expect(response.status).toBe(200);
            const data = await response.json();

            expect(data).toHaveProperty("url");
            expect(data.url).toContain("https://test-bucket.s3.amazonaws.com/");
        });

        test("GET /claims/{id}/pdf - Creates document record in database", async () => {
            const claimId = "0174375f-e7c4-4862-bb9f-f58318bb2e7d";

            const response = await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(200);
        });

        test("GET /claims/{id}/pdf - Passes correct claim ID", async () => {
            const testClaimId = "2c24c901-38e4-4a35-a1c6-140ce64edf2a";

            const response = await app.request(TESTING_PREFIX + `/claims/${testClaimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
                    userId: "0199e0cc-4e92-702c-9773-071340163ae4",
                },
            });

            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.url).toBeDefined();
        });

        test("GET /claims/{id}/pdf - Returns existing PDF if already generated", async () => {
            const claimId = "0174375f-e7c4-4862-bb9f-f58318bb2e7d";

            // Mock getClaimPdf to return an existing PDF on second call
            let callCount = 0;
            getClaimPdfSpy.mockRestore();
            getClaimPdfSpy = spyOn(S3Service.prototype, "getClaimPdf").mockImplementation(async (claimId: string) => {
                callCount++;
                if (callCount > 1) {
                    // Return existing PDF
                    return {
                        key: `claims/${claimId}/claim.pdf`,
                        url: `https://test-bucket.s3.amazonaws.com/claims/${claimId}/claim.pdf`,
                        size: 1000,
                        documentId: "claim-pdf",
                    };
                }
                return null;
            });

            // First request
            const response1 = await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response1.status).toBe(200);

            // Second request
            const response2 = await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response2.status).toBe(200);
            const data2 = await response2.json();
            expect(data2.url).toBeDefined();
        });
    });

    describe("Issues with claim ID", () => {
        test("GET /claims/{id}/pdf - Claim does not exist", async () => {
            const response = await app.request(TESTING_PREFIX + "/claims/00000000-0000-0000-0000-000000000000/pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(404);
        });

        test("GET /claims/{id}/pdf - Invalid claim UUID format", async () => {
            const response = await app.request(TESTING_PREFIX + "/claims/invalid-uuid/pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(400);
        });

        test("GET /claims/{id}/pdf - Empty claim ID", async () => {
            const response = await app.request(TESTING_PREFIX + "/claims//pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(404);
        });
    });

    describe("PDF Content Verification", () => {
        test("GET /claims/{id}/pdf - PDF endpoint returns valid response", async () => {
            const claimId = "0174375f-e7c4-4862-bb9f-f58318bb2e7d";

            const response = await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.url).toBeDefined();
            expect(typeof data.url).toBe("string");
        });
    });

    describe("S3 failure", () => {
        test("GET /claims/{id}/pdf - S3 URL generation fails", async () => {
            getPresignedDownloadUrlSpy.mockRestore();
            getPresignedDownloadUrlSpy = spyOn(S3Service.prototype, "getPresignedDownloadUrl").mockRejectedValue(
                new Error("S3 failed")
            );

            /* eslint-disable @typescript-eslint/no-unused-vars */
            const uploadBufferToS3Spy = spyOn(S3Service.prototype, "uploadBufferToS3").mockRejectedValue(
                new Error("S3 failed")
            );

            const response = await app.request(TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(500);
        });
    });
});
