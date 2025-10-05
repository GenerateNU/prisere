import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("POST /purchase - Create or Update Purchase", () => {
    let app: Hono;
    let backup: IBackup;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    let company_id: string;

    beforeEach(async () => {
        const sampleCompany = {
            name: "Test Company",
        };
        const response = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sampleCompany),
        });
        const body = await response.json();
        company_id = body.id;
    });

    afterEach(async () => {
        backup.restore();
    });

    describe("Create Purchase", () => {
        test("should successfully create a purchase with all required fields", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 50000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).toHaveProperty("id");
            expect(data.companyId).toBe(requestBody.companyId);
            expect(data.quickBooksID).toBe(requestBody.quickBooksID);
            expect(data.totalAmountCents).toBe(requestBody.totalAmountCents);
            expect(data.isRefund).toBe(false);
            expect(data).toHaveProperty("dateCreated");
        });

        test("should successfully create a purchase with isRefund set to true", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 50000,
                isRefund: true,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.isRefund).toBe(true);
        });

        test("should default isRefund to false when not provided", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 50000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.isRefund).toBe(false);
        });

        test("should handle large totalAmountCents values", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 99999,
                totalAmountCents: 999999999,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.totalAmountCents).toBe(requestBody.totalAmountCents);
        });

        test("should handle zero totalAmountCents", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 0,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.totalAmountCents).toBe(0);
        });

        test("should fail with 400 when companyId is missing", async () => {
            const requestBody = {
                quickBooksID: 12345,
                totalAmountCents: 50000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when companyId is empty string", async () => {
            const requestBody = {
                companyId: "",
                quickBooksID: 12345,
                totalAmountCents: 50000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when quickBooksID is missing", async () => {
            const requestBody = {
                companyId: company_id,
                totalAmountCents: 50000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when quickBooksID is not a number", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: "not-a-number",
                totalAmountCents: 50000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when totalAmountCents is missing", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when totalAmountCents is not a number", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: "50000",
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when totalAmountCents is negative", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: -50000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when isRefund is not a boolean", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 50000,
                isRefund: "true",
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 500 when body is malformed JSON", async () => {
            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "{ invalid json }",
            });

            expect(response.status).toBe(500);
        });

        test("should fail with 500 when body is empty", async () => {
            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "",
            });

            expect(response.status).toBe(500);
        });

        test("should reject extra fields not in schema", async () => {
            const requestBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 50000,
                extraField: "should not be allowed",
                anotherExtra: 123,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).not.toHaveProperty("extraField");
            expect(data).not.toHaveProperty("anotherExtra");
        });
    });

    describe("Update Purchase", () => {
        test("should successfully update an existing purchase", async () => {
            // First create a purchase
            const createBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 50000,
            };

            const createResponse = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(createBody),
            });

            const createdPurchase = await createResponse.json();
            const purchaseId = createdPurchase.id;

            // Now update it
            const updateBody = {
                purchaseID: purchaseId,
                totalAmountCents: 75000,
                isRefund: true,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateBody),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.id).toBe(purchaseId);
            expect(data.totalAmountCents).toBe(updateBody.totalAmountCents);
            expect(data.isRefund).toBe(updateBody.isRefund);
        });

        test("should update only quickBooksID when provided", async () => {
            const createBody = {
                companyId: company_id,
                quickBooksID: 12345,
                totalAmountCents: 50000,
            };

            const createResponse = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(createBody),
            });

            const createdPurchase = await createResponse.json();

            const updateBody = {
                purchaseID: createdPurchase.id,
                quickBooksID: 99999,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateBody),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.quickBooksID).toBe(updateBody.quickBooksID);
            expect(data.totalAmountCents).toBe(createBody.totalAmountCents);
        });

        test("should fail with 404 when updating non-existent purchase", async () => {
            const updateBody = {
                purchaseID: "b82951e8-e30d-4c84-8d02-c28f29143101",
                totalAmountCents: 75000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateBody),
            });

            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when purchaseID is invalid UUID format", async () => {
            const updateBody = {
                purchaseID: "not-a-valid-uuid",
                totalAmountCents: 75000,
            };

            const response = await app.request("/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });
    });
});
