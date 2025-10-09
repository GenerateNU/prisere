import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { PurchaseLineItemType } from "../../entities/PurchaseLineItem";

describe("GET /purchases/:id/lines", () => {
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

    const createPurchase = async (companyId: string) => {
        const purchaseBody = {
            quickBooksId: 12345,
            totalAmountCents: 100000,
            isRefund: false,
            companyId: companyId,
        };

        const response = await app.request("/purchase", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify([purchaseBody]),
        });

        const purchases = await response.json();

        return purchases[0];
    };

    const createPurchaseLineItems = async (purchaseId: string, count: number = 1) => {
        const lineItemsBody = [];

        for (let i = 0; i < count; i++) {
            lineItemsBody.push({
                description: `Line Item ${i + 1}`,
                quickBooksId: 100 + i,
                purchaseId: purchaseId,
                amountCents: 1000 * (i + 1),
                category: `Category ${i + 1}`,
                type: i % 2 === 0 ? PurchaseLineItemType.TYPICAL : PurchaseLineItemType.EXTRANEOUS,
            });
        }

        const response = await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemsBody),
        });

        return await response.json();
    };

    test("GET /purchases/:id/lines - Purchase with Single Line Item", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        await createPurchaseLineItems(purchase.id, 1);

        const response = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(1);
        expect(body[0].purchaseId).toBe(purchase.id);
        expect(body[0].description).toBe("Line Item 1");
        expect(body[0].id).toBeDefined();
        expect(body[0].dateCreated).toBeDefined();
        expect(body[0].lastUpdated).toBeDefined();
    });

    test("GET /purchases/:id/lines - Purchase with Multiple Line Items", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        await createPurchaseLineItems(purchase.id, 5);

        const response = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(5);

        body.forEach((item: any, index: number) => {
            expect(item.purchaseId).toBe(purchase.id);
            expect(item.description).toBe(`Line Item ${index + 1}`);
            expect(item.quickBooksId).toBe(100 + index);
            expect(item.amountCents).toBe(1000 * (index + 1));
            expect(item.category).toBe(`Category ${index + 1}`);
            expect(item.type).toBe(index % 2 === 0 ? PurchaseLineItemType.TYPICAL : PurchaseLineItemType.EXTRANEOUS);
        });
    });

    test("GET /purchases/:id/lines - Purchase with No Line Items", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const response = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    test("GET /purchases/:id/lines - Purchase with Many Line Items", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        await createPurchaseLineItems(purchase.id, 25);

        const response = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(25);
    });

    test("GET /purchases/:id/lines - Multiple Purchases Have Different Line Items", async () => {
        const company = await createCompany();
        const purchase1 = await createPurchase(company.id);
        const purchase2 = await createPurchase(company.id);

        await createPurchaseLineItems(purchase1.id, 3);
        await createPurchaseLineItems(purchase2.id, 2);

        const response1 = await app.request(`/purchase/${purchase1.id}/lines`, {
            method: "GET",
        });

        const response2 = await app.request(`/purchase/${purchase2.id}/lines`, {
            method: "GET",
        });

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

        const body1 = await response1.json();
        const body2 = await response2.json();

        expect(body1.length).toBe(3);
        expect(body2.length).toBe(2);

        body1.forEach((item: any) => {
            expect(item.purchaseId).toBe(purchase1.id);
        });

        body2.forEach((item: any) => {
            expect(item.purchaseId).toBe(purchase2.id);
        });
    });

    test("GET /purchases/:id/lines - Line Items with Various Types", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemsBody = [
            {
                description: "Employee Expense",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Expenses",
                type: PurchaseLineItemType.TYPICAL,
            },
            {
                description: "Contractor Work",
                quickBooksId: 102,
                purchaseId: purchase.id,
                amountCents: 15000,
                category: "Services",
                type: PurchaseLineItemType.EXTRANEOUS,
            },
        ];

        await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemsBody),
        });

        const response = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.length).toBe(2);

        const extraneousItem = body.find((item: any) => item.type === PurchaseLineItemType.TYPICAL);
        const typicalItem = body.find((item: any) => item.type === PurchaseLineItemType.EXTRANEOUS);

        expect(extraneousItem).toBeDefined();
        expect(typicalItem).toBeDefined();
        expect(extraneousItem.amountCents).toBe(5000);
        expect(typicalItem.amountCents).toBe(15000);
    });

    test("GET /purchases/:id/lines - Line Items with Various Amounts", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemsBody = [
            {
                description: "Zero Amount",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 0,
                category: "Free",
                type: PurchaseLineItemType.TYPICAL,
            },
            {
                description: "Small Amount",
                quickBooksId: 102,
                purchaseId: purchase.id,
                amountCents: 1,
                category: "Minimal",
                type: PurchaseLineItemType.TYPICAL,
            },
            {
                description: "Large Amount",
                quickBooksId: 103,
                purchaseId: purchase.id,
                amountCents: 10000000,
                category: "Expensive",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemsBody),
        });

        const response = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.length).toBe(3);

        const amounts = body.map((item: any) => item.amountCents).sort((a: number, b: number) => a - b);
        expect(amounts).toEqual([0, 1, 10000000]);
    });

    test("GET /purchases/:id/lines - Non-Existent Purchase ID", async () => {
        const response = await app.request("/purchase/111e99a6-d082-4327-9843-97fd228d4d37/lines", {
            method: "GET",
        });

        expect([200, 404]).toContain(response.status);

        if (response.status === 200) {
            const body = await response.json();
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBe(0);
        }
    });

    test("GET /purchases/:id/lines - Invalid UUID Format", async () => {
        const response = await app.request("/purchase/invalid-uuid-format/lines", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - Empty Purchase ID", async () => {
        const response = await app.request("/purchase//lines", {
            method: "GET",
        });

        expect([404, 405]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - Special Characters in Purchase ID", async () => {
        const response = await app.request("/purchase/@#$%^&*()/lines", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - Numeric Purchase ID", async () => {
        const response = await app.request("/purchase/12345/lines", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - Very Long Purchase ID String", async () => {
        const longId = "a".repeat(500);
        const response = await app.request(`/purchase/${longId}/lines`, {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - Malformed UUID (Missing Segment)", async () => {
        const response = await app.request("/purchase/123e4567-e89b-12d3-a456/lines", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - Malformed UUID (Extra Segment)", async () => {
        const response = await app.request("/purchase/123e4567-e89b-12d3-a456-426614174000-extra/lines", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - SQL Injection Attempt", async () => {
        const response = await app.request("/purchase/'; DROP TABLE purchase_line_items; --/lines", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - After Adding More Line Items", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        // Create initial line items
        await createPurchaseLineItems(purchase.id, 2);

        const firstResponse = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        const firstBody = await firstResponse.json();
        expect(firstBody.length).toBe(2);

        // Add more line items
        await createPurchaseLineItems(purchase.id, 3);

        const secondResponse = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        const secondBody = await secondResponse.json();
        expect(secondBody.length).toBe(5);
    });

    test("GET /purchases/:id/lines - URL Encoded Purchase ID", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        await createPurchaseLineItems(purchase.id, 1);

        const encodedId = encodeURIComponent(purchase.id);
        const response = await app.request(`/purchase/${encodedId}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.length).toBe(1);
    });

    test("GET /purchases/:id/lines - Mixed Case UUID", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        await createPurchaseLineItems(purchase.id, 1);

        const mixedCaseId = purchase.id
            .split("")
            .map((char: string, i: number) => (i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
            .join("");

        const response = await app.request(`/purchase/${mixedCaseId}/lines`, {
            method: "GET",
        });

        expect([200, 404]).toContain(response.status);
    });

    test("GET /purchases/:id/lines - Line Items Ordered Consistently", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        await createPurchaseLineItems(purchase.id, 10);

        const response1 = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        const response2 = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        const body1 = await response1.json();
        const body2 = await response2.json();

        expect(body1.length).toBe(10);
        expect(body2.length).toBe(10);

        // Check that the order is consistent across requests
        body1.forEach((item: any, index: number) => {
            expect(item.id).toBe(body2[index].id);
        });
    });

    test("GET /purchases/:id/lines - All Line Items Have Required Fields", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        await createPurchaseLineItems(purchase.id, 5);

        const response = await app.request(`/purchase/${purchase.id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();

        body.forEach((item: any) => {
            expect(item.id).toBeDefined();
            expect(item.description).toBeDefined();
            expect(item.quickBooksId).toBeDefined();
            expect(item.purchaseId).toBe(purchase.id);
            expect(item.amountCents).toBeDefined();
            expect(item.category).toBeDefined();
            expect(item.type).toBeDefined();
            expect(item.dateCreated).toBeDefined();
            expect(item.lastUpdated).toBeDefined();
        });
    });
});
