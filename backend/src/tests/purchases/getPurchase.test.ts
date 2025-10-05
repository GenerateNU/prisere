import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

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

    test("GET /purchases/:id - Valid Purchase ID", async () => {
        // First create a purchase to retrieve
        const createBody = {
            companyId: "company-123",
            quickBooksID: 12345,
            totalAmountCents: 50000,
            isRefund: false,
        };

        const createResponse = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createBody),
        });

        const createdPurchase = await createResponse.json();

        // Now retrieve the purchase
        const response = await app.request(`/purchases/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.id).toBe(createdPurchase.id);
        expect(body.companyId).toBe(createBody.companyId);
        expect(body.quickBooksID).toBe(createBody.quickBooksID);
        expect(body.totalAmountCents).toBe(createBody.totalAmountCents);
        expect(body.isRefund).toBe(createBody.isRefund);
        expect(body.dateCreated).toBeDefined();
        expect(body.lastUpdated).toBeDefined();
    });

    test("GET /purchases/:id - Valid Purchase ID with Refund", async () => {
        // Create a refund purchase
        const createBody = {
            companyId: "company-456",
            quickBooksID: 67890,
            totalAmountCents: 25000,
            isRefund: true,
        };

        const createResponse = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(createBody),
        });

        const createdPurchase = await createResponse.json();

        // Retrieve the purchase
        const response = await app.request(`/purchases/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.isRefund).toBe(true);
    });

    test("GET /purchases/:id - Non-Existent Purchase ID", async () => {
        const response = await app.request("/purchases/non-existent-id-12345", {
            method: "GET",
        });

        expect(response.status).toBe(404);
    });

    test("GET /purchases/:id - Empty Purchase ID", async () => {
        const response = await app.request("/purchases/", {
            method: "GET",
        });

        // This might return 404 or 405 depending on routing
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
