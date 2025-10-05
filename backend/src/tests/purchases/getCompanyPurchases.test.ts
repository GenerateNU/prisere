import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("GET /purchases/mycompany - Get Company Purchases", () => {
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

    test("should successfully retrieve purchases for a company", async () => {
        // Create multiple purchases for the company
        const purchases = [
            {
                companyId: company_id,
                quickBooksID: 11111,
                totalAmountCents: 10000,
            },
            {
                companyId: company_id,
                quickBooksID: 22222,
                totalAmountCents: 20000,
            },
            {
                companyId: company_id,
                quickBooksID: 33333,
                totalAmountCents: 30000,
            },
        ];

        for (const purchase of purchases) {
            await app.request("/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(purchase),
            });
        }

        // Retrieve all purchases for company
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(3);

        // Verify all purchases belong to the company
        data.forEach((purchase: any) => {
            expect(purchase).toHaveProperty("id");
            expect(purchase.companyId).toBe(company_id);
            expect(purchase).toHaveProperty("quickBooksID");
            expect(purchase).toHaveProperty("totalAmountCents");
            expect(purchase).toHaveProperty("isRefund");
            expect(purchase).toHaveProperty("dateCreated");
        });
    });

    test("should return empty array when company has no purchases", async () => {
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
    });

    test("should handle pagination with pageNumber parameter", async () => {
        // Create 25 purchases to test pagination
        for (let i = 0; i < 25; i++) {
            await app.request("/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: company_id,
                    quickBooksID: 10000 + i,
                    totalAmountCents: 1000 * (i + 1),
                }),
            });
        }

        // Get first page (default 20 results)
        const response1 = await app.request(`/purchases/mycompany?companyId=${company_id}&pageNumber=0`, {
            method: "GET",
        });

        expect(response1.status).toBe(200);
        const data1 = await response1.json();
        expect(data1.length).toBe(20);

        // Get second page
        const response2 = await app.request(`/purchases/mycompany?companyId=${company_id}&pageNumber=1`, {
            method: "GET",
        });

        expect(response2.status).toBe(200);
        const data2 = await response2.json();
        expect(data2.length).toBe(5);
    });

    test("should handle custom resultsPerPage parameter", async () => {
        // Create 15 purchases
        for (let i = 0; i < 15; i++) {
            await app.request("/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: company_id,
                    quickBooksID: 20000 + i,
                    totalAmountCents: 5000,
                }),
            });
        }

        // Get with custom results per page
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&resultsPerPage=5`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(5);
    });

    test("should handle both pageNumber and resultsPerPage parameters", async () => {
        // Create 30 purchases
        for (let i = 0; i < 30; i++) {
            await app.request("/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: company_id,
                    quickBooksID: 30000 + i,
                    totalAmountCents: 2500,
                }),
            });
        }

        // Get page 2 with 10 results per page
        const response = await app.request(
            `/purchases/mycompany?companyId=${company_id}&pageNumber=2&resultsPerPage=10`,
            { method: "GET" }
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(10);
    });

    test("should default to pageNumber 0 when not provided", async () => {
        // Create 5 purchases
        for (let i = 0; i < 5; i++) {
            await app.request("/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: company_id,
                    quickBooksID: 40000 + i,
                    totalAmountCents: 3000,
                }),
            });
        }

        const response = await app.request(`/purchases/mycompany?companyId=${company_id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(5);
    });

    test("should default to resultsPerPage 20 when not provided", async () => {
        // Create 25 purchases
        for (let i = 0; i < 25; i++) {
            await app.request("/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: company_id,
                    quickBooksID: 50000 + i,
                    totalAmountCents: 4000,
                }),
            });
        }

        const response = await app.request(`/purchases/mycompany?companyId=${company_id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(20);
    });

    test("should fail with 400 when companyId is missing", async () => {
        const response = await app.request("/purchases/mycompany", {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should fail with 400 when companyId is empty string", async () => {
        const response = await app.request("/purchases/mycompany?companyId=", {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should fail with 400 when companyId is not a valid format", async () => {
        const response = await app.request("/purchases/mycompany?companyId=not-a-number", {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should fail with 400 when pageNumber is negative", async () => {
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&pageNumber=-1`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should fail with 400 when resultsPerPage is negative", async () => {
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&resultsPerPage=-10`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should fail with 400 when pageNumber is not a number", async () => {
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&pageNumber=abc`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should fail with 400 when resultsPerPage is not a number", async () => {
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&resultsPerPage=xyz`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should only return purchases for specified company", async () => {
        // Create second company
        const secondCompany = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Second Company" }),
        });
        const secondCompanyData = await secondCompany.json();
        const secondCompanyId = secondCompanyData.id;

        // Create purchases for first company
        await app.request("/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyId: company_id,
                quickBooksID: 60001,
                totalAmountCents: 10000,
            }),
        });

        // Create purchases for second company
        await app.request("/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyId: secondCompanyId,
                quickBooksID: 60002,
                totalAmountCents: 20000,
            }),
        });

        // Get purchases for first company
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(1);
        expect(data[0].companyId).toBe(company_id);
        expect(data[0].quickBooksID).toBe(60001);
    });

    test("should include both refund and non-refund purchases", async () => {
        // Create regular purchase
        await app.request("/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyId: company_id,
                quickBooksID: 70001,
                totalAmountCents: 10000,
                isRefund: false,
            }),
        });

        // Create refund purchase
        await app.request("/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                companyId: company_id,
                quickBooksID: 70002,
                totalAmountCents: 5000,
                isRefund: true,
            }),
        });

        const response = await app.request(`/purchases/mycompany?companyId=${company_id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(2);

        const refunds = data.filter((p: any) => p.isRefund === true);
        const nonRefunds = data.filter((p: any) => p.isRefund === false);

        expect(refunds.length).toBe(1);
        expect(nonRefunds.length).toBe(1);
    });

    test("should handle resultsPerPage of 0", async () => {
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&resultsPerPage=0`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should handle very large pageNumber when no data exists", async () => {
        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&pageNumber=999`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
    });

    test("should handle very large resultsPerPage value", async () => {
        // Create 5 purchases
        for (let i = 0; i < 5; i++) {
            await app.request("/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId: company_id,
                    quickBooksID: 80000 + i,
                    totalAmountCents: 1000,
                }),
            });
        }

        const response = await app.request(`/purchases/mycompany?companyId=${company_id}&resultsPerPage=1000`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(5);
    });
});
