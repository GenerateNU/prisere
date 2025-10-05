import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("GET /purchase/:id - Get Purchase", () => {
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

    test("should successfully retrieve an existing purchase", async () => {
        // First create a purchase
        const createBody = {
            companyId: company_id,
            quickBooksID: 12345,
            totalAmountCents: 50000,
            isRefund: false,
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

        // Now retrieve it
        const response = await app.request(`/purchase/${purchaseId}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(purchaseId);
        expect(data.companyId).toBe(createBody.companyId);
        expect(data.quickBooksID).toBe(createBody.quickBooksID);
        expect(data.totalAmountCents).toBe(createBody.totalAmountCents);
        expect(data.isRefund).toBe(createBody.isRefund);
        expect(data).toHaveProperty("dateCreated");
        expect(data).toHaveProperty("lastUpdated");
    });

    test("should retrieve purchase with all date fields", async () => {
        const createBody = {
            companyId: company_id,
            quickBooksID: 67890,
            totalAmountCents: 100000,
            isRefund: true,
        };

        const createResponse = await app.request("/purchase", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createBody),
        });

        const createdPurchase = await createResponse.json();

        const response = await app.request(`/purchase/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.dateCreated).toBeDefined();
        expect(data.lastUpdated).toBeDefined();
        expect(new Date(data.dateCreated)).toBeInstanceOf(Date);
        expect(new Date(data.lastUpdated)).toBeInstanceOf(Date);
    });

    test("should return 404 for non-existent purchase id", async () => {
        const response = await app.request("/purchase/b82951e8-e30d-4c84-8d02-c28f29143101", {
            method: "GET",
        });

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should return 400 for invalid UUID format", async () => {
        const response = await app.request("/purchase/not-a-valid-uuid", {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should return 400 for empty string id", async () => {
        const response = await app.request("/purchase/", {
            method: "GET",
        });

        expect(response.status).toBe(404);
        expect(response.ok).toBe(false);
    });

    test("should return 400 for special characters in id", async () => {
        const response = await app.request("/purchase/abc@#$%", {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should retrieve purchase after it has been updated", async () => {
        // Create purchase
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

        // Update purchase
        const updateBody = {
            purchaseID: purchaseId,
            totalAmountCents: 75000,
            isRefund: true,
        };

        await app.request("/purchase", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateBody),
        });

        // Retrieve updated purchase
        const response = await app.request(`/purchase/${purchaseId}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(purchaseId);
        expect(data.totalAmountCents).toBe(75000);
        expect(data.isRefund).toBe(true);
    });

    test("should handle multiple purchases and retrieve correct one", async () => {
        // Create multiple purchases
        const purchase1 = {
            companyId: company_id,
            quickBooksID: 11111,
            totalAmountCents: 10000,
        };

        const purchase2 = {
            companyId: company_id,
            quickBooksID: 22222,
            totalAmountCents: 20000,
        };

        const purchase3 = {
            companyId: company_id,
            quickBooksID: 33333,
            totalAmountCents: 30000,
        };

        const response1 = await app.request("/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(purchase1),
        });
        const created1 = await response1.json();

        const response2 = await app.request("/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(purchase2),
        });
        const created2 = await response2.json();

        const response3 = await app.request("/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(purchase3),
        });
        const created3 = await response3.json();

        // Retrieve second purchase
        const getResponse = await app.request(`/purchase/${created2.id}`, {
            method: "GET",
        });

        expect(getResponse.status).toBe(200);
        const data = await getResponse.json();
        expect(data.id).toBe(created2.id);
        expect(data.quickBooksID).toBe(22222);
        expect(data.totalAmountCents).toBe(20000);
    });

    test("should handle very long UUID-like strings", async () => {
        const longUuid = "b82951e8-e30d-4c84-8d02-c28f29143101-extra-characters";

        const response = await app.request(`/purchase/${longUuid}`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should retrieve refund purchase correctly", async () => {
        const createBody = {
            companyId: company_id,
            quickBooksID: 99999,
            totalAmountCents: 50000,
            isRefund: true,
        };

        const createResponse = await app.request("/purchase", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createBody),
        });

        const createdPurchase = await createResponse.json();

        const response = await app.request(`/purchase/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.isRefund).toBe(true);
    });
});
