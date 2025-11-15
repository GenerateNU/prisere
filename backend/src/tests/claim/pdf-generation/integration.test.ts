import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach, spyOn } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { PDFParse } from "pdf-parse";
import { startTestApp } from "../../setup-tests";
import { TESTING_PREFIX } from "../../../utilities/constants";
import { S3Service } from "../../../modules/s3/service";
import { initPdfTestData } from "./setup";
import { Claim } from "../../../entities/Claim";

describe("GET /claims/{id}/pdf - Generate Claim PDF", () => {
    let app: Hono;
    let backup: IBackup;
    let testAppDataSource: DataSource;
    let uploadSpy: any;
    let capturedBuffer: Buffer | undefined;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        testAppDataSource = testAppData.dataSource;
        process.env.OBJECTS_STORAGE_BUCKET_NAME = "test-bucket";
    });

    beforeEach(async () => {
        await initPdfTestData(testAppDataSource);
        capturedBuffer = undefined;

        // Mock S3 upload with complete implementation
        uploadSpy = spyOn(S3Service.prototype, "uploadPdf").mockImplementation(
            async (options: {
                claimId: string;
                pdfBuffer: Buffer;
                documentId?: string | undefined;
                originalFilename?: string | undefined;
            }) => {
                capturedBuffer = options.pdfBuffer;
                return {
                    url: `https://test-bucket.s3.amazonaws.com/claims/${options.claimId}.pdf`,
                    key: `claims/${options.claimId}.pdf`,
                    size: options.pdfBuffer.length,
                    hash: "test-hash",
                    isDuplicate: false,
                    duplicateKey: undefined,
                };
            }
        );
    });

    afterEach(() => {
        backup.restore();
        uploadSpy.mockRestore();
    });

    describe("Successful PDF Generation", () => {
        test("GET /claims/{id}/pdf - Successfully generates PDF and returns S3 URL", async () => {
            const response = await app.request(TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(200);
            const data = await response.json();

            expect(data).toHaveProperty("url");
            expect(data.url).toContain("https://test-bucket.s3.amazonaws.com/claims/");

            expect(uploadSpy).toHaveBeenCalledTimes(1);
            expect(uploadSpy).toHaveBeenCalledWith({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                pdfBuffer: expect.any(Buffer),
            });
        });

        test("GET /claims/{id}/pdf - Generates valid PDF buffer", async () => {
            const response = await app.request(TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(200);

            expect(capturedBuffer).toBeDefined();
            expect(Buffer.isBuffer(capturedBuffer)).toBe(true);
            expect(capturedBuffer!.length).toBeGreaterThan(0);
            expect(capturedBuffer!.toString("utf-8", 0, 4)).toBe("%PDF");
        });

        test("GET /claims/{id}/pdf - Passes correct claim ID to S3", async () => {
            const testClaimId = "2c24c901-38e4-4a35-a1c6-140ce64edf2a";

            const response = await app.request(TESTING_PREFIX + `/claims/${testClaimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
                    userId: "0199e0cc-4e92-702c-9773-071340163ae4", // John Doe from Company Cool
                },
            });

            expect(response.status).toBe(200);

            expect(uploadSpy).toHaveBeenCalledWith({
                claimId: testClaimId,
                pdfBuffer: expect.any(Buffer),
            });
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
            expect(uploadSpy).not.toHaveBeenCalled();
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
            expect(uploadSpy).not.toHaveBeenCalled();
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
            expect(uploadSpy).not.toHaveBeenCalled();
        });
    });

    describe("PDF Content Verification - Exact Data", () => {
        test("GET /claims/{id}/pdf - PDF contains exact company and user data from database", async () => {
            const claimId = "0174375f-e7c4-4862-bb9f-f58318bb2e7d";

            // Get actual data from database
            const claimRepository = testAppDataSource.getRepository(Claim);
            const claim = await claimRepository.findOne({
                where: { id: claimId },
                relations: [
                    "company",
                    "selfDisaster",
                    "claimLocations",
                    "claimLocations.locationAddress",
                    "purchaseLineItems",
                ],
            });

            expect(claim).toBeDefined();

            // Generate the PDF
            const response = await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(200);
            expect(capturedBuffer).toBeDefined();

            // Parse the PDF
            const uint8Array = new Uint8Array(capturedBuffer!);
            const pdfData = await new PDFParse(uint8Array).getText();

            // Verify company name
            expect(pdfData.text).toContain("Northeastern Inc.");

            // Verify user data (from userId in header)
            expect(pdfData.text).toContain("Zahra");
            expect(pdfData.text).toContain("Wibisana");
            expect(pdfData.text).toContain("zahra.wib@example.com");

            // Verify self-declared disaster
            if (claim!.selfDisaster) {
                expect(pdfData.text).toContain("Self-declared");
                expect(pdfData.text).toContain("Fire in main office building");
            }

            // Verify locations (2 locations seeded for this claim)
            expect(pdfData.text).toContain("360 Huntington Ave");
            expect(pdfData.text).toContain("Boston");
            expect(pdfData.text).toContain("Suffolk");
            expect(pdfData.text).toContain("1 Main St");
            expect(pdfData.text).toContain("Cambridge");
            expect(pdfData.text).toContain("Middlesex");

            // Verify expenses
            expect(pdfData.text).toContain("Emergency supplies");
            expect(pdfData.text).toContain("$250.00");
            expect(pdfData.text).toContain("Temporary housing");
            expect(pdfData.text).toContain("$2000.00");
        });

        test("GET /claims/{id}/pdf - PDF contains exact FEMA disaster data", async () => {
            const claimId = "37d07be0-4e09-4e70-a395-c1464f408c1f";

            const claimRepository = testAppDataSource.getRepository(Claim);
            const claim = await claimRepository.findOne({
                where: { id: claimId },
                relations: ["company", "femaDisaster"],
            });

            expect(claim).toBeDefined();
            expect(claim!.femaDisaster).toBeDefined();

            await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            const uint8Array = new Uint8Array(capturedBuffer!);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain("Northeastern Inc.");
            expect(pdfData.text).toContain("Flooding"); // From designatedIncidentTypes

            const declarationDate = new Date(claim!.femaDisaster!.declarationDate).toLocaleDateString();
            expect(pdfData.text).toContain(declarationDate);
        });

        test("GET /claims/{id}/pdf - PDF contains exact expense amounts from database", async () => {
            const claimId = "0174375f-e7c4-4862-bb9f-f58318bb2e7d";

            const claimRepository = testAppDataSource.getRepository(Claim);
            const claim = await claimRepository.findOne({
                where: { id: claimId },
                relations: ["purchaseLineItems"],
            });

            expect(claim).toBeDefined();

            await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            const uint8Array = new Uint8Array(capturedBuffer!);
            const pdfData = await new PDFParse(uint8Array).getText();

            // Verify exact amounts from seeded data
            expect(pdfData.text).toContain("Emergency supplies");
            expect(pdfData.text).toContain("$250.00");
            expect(pdfData.text).toContain("Temporary housing");
            expect(pdfData.text).toContain("$2000.00");
        });

        test("GET /claims/{id}/pdf - Verify exact formatted dates in PDF", async () => {
            const claimId = "37d07be0-4e09-4e70-a395-c1464f408c1f";

            const claimRepository = testAppDataSource.getRepository(Claim);
            const claim = await claimRepository.findOne({
                where: { id: claimId },
                relations: ["femaDisaster"],
            });

            expect(claim?.femaDisaster).toBeDefined();

            await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            const uint8Array = new Uint8Array(capturedBuffer!);
            const pdfData = await new PDFParse(uint8Array).getText();

            // Verify dates (from seeded FEMA disaster)
            expect(pdfData.text).toContain("1/15/2024"); // declarationDate
            expect(pdfData.text).toContain("1/10/2024"); // incidentBeginDate
            expect(pdfData.text).toContain("1/20/2024"); // incidentEndDate
        });

        test("GET /claims/{id}/pdf - PDF contains all required sections", async () => {
            const response = await app.request(TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(200);
            expect(capturedBuffer).toBeDefined();

            const uint8Array = new Uint8Array(capturedBuffer!);
            const pdfData = await new PDFParse(uint8Array).getText();

            expect(pdfData.text).toContain("Insurance Claim Report");
            expect(pdfData.text).toContain("Business Information");
            expect(pdfData.text).toContain("Personal Information");
            expect(pdfData.text).toContain("Disaster Specific Information");
            expect(pdfData.text).toContain("Affected Business\nLocations");
            expect(pdfData.text).toContain("Extreneous Expenses");
            expect(pdfData.text).toContain("Average Revenue");
        });

        test("GET /claims/{id}/pdf - PDF contains exact location data", async () => {
            const claimId = "0174375f-e7c4-4862-bb9f-f58318bb2e7d";

            const claimRepository = testAppDataSource.getRepository(Claim);
            const claim = await claimRepository.findOne({
                where: { id: claimId },
                relations: ["claimLocations", "claimLocations.locationAddress"],
            });

            expect(claim).toBeDefined();

            await app.request(TESTING_PREFIX + `/claims/${claimId}/pdf`, {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            const uint8Array = new Uint8Array(capturedBuffer!);
            const pdfData = await new PDFParse(uint8Array).getText();

            // Verify both locations from database
            claim!.claimLocations!.forEach((claimLocation: any) => {
                const addr = claimLocation.locationAddress;
                expect(pdfData.text).toContain(addr.streetAddress);
                expect(pdfData.text).toContain(addr.city);
                expect(pdfData.text).toContain(addr.stateProvince);
                expect(pdfData.text).toContain(addr.postalCode);
                if (addr.county) {
                    expect(pdfData.text).toContain(addr.county);
                }
            });
        });
    });

    describe("S3 failure", () => {
        test("GET /claims/{id}/pdf - S3 upload fails", async () => {
            uploadSpy.mockRestore();
            uploadSpy = spyOn(S3Service.prototype, "uploadPdf").mockRejectedValue(new Error("S3 upload failed"));

            const response = await app.request(TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/pdf", {
                method: "GET",
                headers: {
                    companyId: "5667a729-f000-4190-b4ee-7957badca27b",
                    userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                },
            });

            expect(response.status).toBe(500);
            expect(uploadSpy).toHaveBeenCalledTimes(1);
        });
    });
});
