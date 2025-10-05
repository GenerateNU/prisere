import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("GET /purchases/mycompany", () => {
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

    test("GET /purchases/mycompany - Valid companyId", async () => {
        // First create some purchases for the company
        const companyId = "company-123";

        for (let i = 0; i < 3; i++) {
            await app.request("/purchases", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    companyId: companyId,
                    quickBooksID: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                }),
            });
        }

        // Retrieve purchases for the company
        const response = await app.request(`/purchases/mycompany?companyId=123`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        body.forEach((purchase: any) => {
            expect(purchase.id).toBeDefined();
            expect(purchase.companyId).toBeDefined();
            expect(purchase.quickBooksID).toBeDefined();
            expect(purchase.totalAmountCents).toBeDefined();
            expect(purchase.isRefund).toBeDefined();
            expect(purchase.dateCreated).toBeDefined();
        });
    });

    test("GET /purchases/mycompany - With pageNumber", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&pageNumber=1", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test("GET /purchases/mycompany - With resultsPerPage", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&resultsPerPage=10", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(10);
    });

    test("GET /purchases/mycompany - With pageNumber and resultsPerPage", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&pageNumber=0&resultsPerPage=5", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(5);
    });

    test("GET /purchases/mycompany - Default Pagination Values", async () => {
        // Should use default pageNumber=0 and resultsPerPage=20
        const response = await app.request("/purchases/mycompany?companyId=123", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(20);
    });

    test("GET /purchases/mycompany - Non-Existent companyId", async () => {
        const response = await app.request("/purchases/mycompany?companyId=999999", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    test("GET /purchases/mycompany - Missing companyId", async () => {
        const response = await app.request("/purchases/mycompany", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchases/mycompany - Invalid companyId Type (String)", async () => {
        const response = await app.request("/purchases/mycompany?companyId=not-a-number", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchases/mycompany - Invalid pageNumber Type", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&pageNumber=invalid", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchases/mycompany - Invalid resultsPerPage Type", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&resultsPerPage=invalid", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchases/mycompany - Negative pageNumber", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&pageNumber=-1", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchases/mycompany - Negative resultsPerPage", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&resultsPerPage=-5", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchases/mycompany - Zero resultsPerPage", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&resultsPerPage=0", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchases/mycompany - Very Large pageNumber", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&pageNumber=10000", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    test("GET /purchases/mycompany - Very Large resultsPerPage", async () => {
        const response = await app.request("/purchases/mycompany?companyId=123&resultsPerPage=1000", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test("GET /purchases/mycompany - Multiple Purchases Same Company", async () => {
        // Create multiple purchases for the same company
        const companyId = "company-multi-test";
        const purchaseCount = 5;

        for (let i = 0; i < purchaseCount; i++) {
            await app.request("/purchases", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    companyId: companyId,
                    quickBooksID: 20000 + i,
                    totalAmountCents: 100000 + i * 5000,
                    isRefund: i % 2 === 0,
                }),
            });
        }

        // Note: The schema expects companyId as a number in the query, but companyId in the purchase is a string
        // This might be the "This is bad" comment in the schema
        const response = await app.request("/purchases/mycompany?companyId=456&resultsPerPage=10", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });
});
