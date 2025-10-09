import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("GET /purchases/line/:id", () => {
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

    const createPurchaseLineItem = async (purchaseId: string) => {
        const lineItemBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                purchaseId: purchaseId,
                amountCents: 5000,
                category: "Supplies",
                type: "typical",
            },
        ];

        const response = await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemBody),
        });

        const lineItems = await response.json();
        return lineItems[0];
    };

    test("GET /purchases/line/:id - Valid Line Item ID", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        const lineItem = await createPurchaseLineItem(purchase.id);

        const response = await app.request(`/purchase/line/${lineItem.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.id).toBe(lineItem.id);
        expect(body.description).toBe(lineItem.description);
        expect(body.quickBooksId).toBe(lineItem.quickBooksId);
        expect(body.purchaseId).toBe(purchase.id);
        expect(body.amountCents).toBe(lineItem.amountCents);
        expect(body.category).toBe(lineItem.category);
        expect(body.type).toBe(lineItem.type);
        expect(body.dateCreated).toBeDefined();
        expect(body.lastUpdated).toBeDefined();
    });

    test("GET /purchases/line/:id - Line Item with typical Type", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Contract Work",
                quickBooksId: 201,
                purchaseId: purchase.id,
                amountCents: 15000,
                category: "Services",
                type: "typical" as const,
            },
        ];

        const createResponse = await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemBody),
        });

        const createdLineItem = (await createResponse.json())[0];

        const response = await app.request(`/purchase/line/${createdLineItem.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.type).toBe("typical");
    });

    test("GET /purchases/line/:id - Line Item with Zero Amount", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Free Item",
                quickBooksId: 301,
                purchaseId: purchase.id,
                amountCents: 0,
                category: "Complimentary",
                type: "typical" as const,
            },
        ];

        const createResponse = await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemBody),
        });

        const createdLineItem = (await createResponse.json())[0];

        const response = await app.request(`/purchase/line/${createdLineItem.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.amountCents).toBe(0);
    });

    test("GET /purchases/line/:id - Line Item with Large Amount", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Expensive Equipment",
                quickBooksId: 401,
                purchaseId: purchase.id,
                amountCents: 10000000,
                category: "Capital Expenditure",
                type: "typical" as const,
            },
        ];

        const createResponse = await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemBody),
        });

        const createdLineItem = (await createResponse.json())[0];

        const response = await app.request(`/purchase/line/${createdLineItem.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.amountCents).toBe(10000000);
    });

    test("GET /purchases/line/:id - Non-Existent Line Item ID", async () => {
        const response = await app.request("/purchase/line/111e99a6-d082-4327-9843-97fd228d4d37", {
            method: "GET",
        });

        expect(response.status).toBe(404);
    });

    test("GET /purchases/line/:id - Empty Line Item ID", async () => {
        const response = await app.request("/purchase/line/", {
            method: "GET",
        });

        expect([404, 405]).toContain(response.status);
    });

    test("GET /purchases/line/:id - Invalid UUID Format", async () => {
        const response = await app.request("/purchase/line/invalid-uuid-format", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - Special Characters in ID", async () => {
        const response = await app.request("/purchase/line/@#$%^&*()", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - Numeric ID", async () => {
        const response = await app.request("/purchase/line/12345", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - Very Long ID String", async () => {
        const longId = "a".repeat(500);
        const response = await app.request(`/purchase/line/${longId}`, {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - ID with Spaces", async () => {
        const response = await app.request("/purchase/line/123 456 789", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - Malformed UUID (Missing Segment)", async () => {
        const response = await app.request("/purchase/line/123e4567-e89b-12d3-a456", {
            method: "GET",
        });

        expect([400]).toContain(response.status);
    });

    test("GET /purchases/line/:id - Malformed UUID (Extra Segment)", async () => {
        const response = await app.request("/purchase/line/123e4567-e89b-12d3-a456-426614174000-extra", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - SQL Injection Attempt", async () => {
        const response = await app.request("/purchase/line/'; DROP TABLE purchase_line_items; --", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - Mixed Case UUID", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        const lineItem = await createPurchaseLineItem(purchase.id);

        const mixedCaseId = lineItem.id
            .split("")
            .map((char: string, i: number) => (i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()))
            .join("");

        const response = await app.request(`/purchase/line/${mixedCaseId}`, {
            method: "GET",
        });

        expect([200, 404]).toContain(response.status);
    });

    test("GET /purchases/line/:id - URL Encoded ID", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        const lineItem = await createPurchaseLineItem(purchase.id);

        const encodedId = encodeURIComponent(lineItem.id);
        const response = await app.request(`/purchase/line/${encodedId}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
    });

    test("GET /purchases/line/:id - Updated Line Item Returns Latest Data", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);
        const lineItem = await createPurchaseLineItem(purchase.id);

        // Update the line item
        const updateBody = [
            {
                id: lineItem.id,
                description: "Updated Description",
                quickBooksId: 999,
                purchaseId: purchase.id,
                amountCents: 9999,
                category: "Updated Category",
                type: "typical" as const,
            },
        ];

        await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateBody),
        });

        // Retrieve the updated line item
        const response = await app.request(`/purchase/line/${lineItem.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.description).toBe("Updated Description");
        expect(body.quickBooksId).toBe(999);
        expect(body.amountCents).toBe(9999);
        expect(body.category).toBe("Updated Category");
        expect(body.type).toBe("typical");
    });
});
