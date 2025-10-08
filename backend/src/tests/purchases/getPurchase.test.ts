import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { CreateOrChangePurchaseDTO } from "../../modules/purchase/types";

describe("GET /purchases/:id", () => {
    let app: Hono;
    let backup: IBackup;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    afterEach(async () => {
        backup.restore();
    });

    const createCompany = async () => {
        const companyRequest = {
            name: "Cool Company",
        };

        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(companyRequest),
        });

        return await createCompanyResponse.json();
    };

    const createPurchase = async (payload: Partial<CreateOrChangePurchaseDTO>) => {
        const createdCompany = await createCompany();

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return (await response.json())[0];
    };

    test("GET /purchases/:id - Valid Purchase ID", async () => {
        const company = await createCompany();
        // First create a purchase to retrieve
        const createBody = {
            quickBooksId: 12345,
            totalAmountCents: 50000,
            isRefund: false,
            companyId: company.id,
        };

        const createdPurchase = await createPurchase([createBody]);

        // Now retrieve the purchase
        const response = await app.request(`/purchases/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.id).toBe(createdPurchase.id);
        expect(body.quickBooksId).toBe(createBody.quickBooksId);
        expect(body.totalAmountCents).toBe(createBody.totalAmountCents);
        expect(body.isRefund).toBe(createBody.isRefund);
        expect(body.dateCreated).toBeDefined();
        expect(body.lastUpdated).toBeDefined();
    });

    test("GET /purchases/:id - Valid Purchase ID with Refund", async () => {
        const company = await createCompany();

        // Create a refund purchase
        const createBody = {
            quickBooksID: 67890,
            totalAmountCents: 25000,
            isRefund: true,
            companyId: company.id,
        };

        const createdPurchase = await createPurchase([createBody]);

        // Retrieve the purchase
        const response = await app.request(`/purchases/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.isRefund).toBe(true);
    });

    test("GET /purchases/:id - Non-Existent Purchase ID", async () => {
        const response = await app.request("/purchases/111e99a6-d082-4327-9843-97fd228d4d37", {
            method: "GET",
        });

        expect(response.status).toBe(404);
    });

    test("GET /purchases/:id - Empty Purchase ID", async () => {
        const response = await app.request("/purchases/", {
            method: "GET",
        });

        expect([404, 405]).toContain(response.status);
    });

    test("GET /purchases/:id - Invalid UUID Format", async () => {
        const response = await app.request("/purchases/invalid-uuid-format", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id - Special Characters in ID", async () => {
        const response = await app.request("/purchases/@#$%^&*()", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id - Numeric ID", async () => {
        const response = await app.request("/purchases/12345", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id - Very Long ID String", async () => {
        const longId = "a".repeat(500);
        const response = await app.request(`/purchases/${longId}`, {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });
});
