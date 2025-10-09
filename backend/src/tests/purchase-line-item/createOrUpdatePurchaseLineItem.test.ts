import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { CreateOrChangePurchaseLineItemsDTO } from "../../modules/purchase-line-item/types";
import { PurchaseLineItemType } from "../../entities/PurchaseLineItem";

describe("POST /purchase/line", () => {
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

    const createPurchaseLineItems = async (payload: CreateOrChangePurchaseLineItemsDTO) => {
        const response = await app.request("/purchase/line", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return response;
    };

    test("POST /purchase/line - Create Single Line Item", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Supplies",
                type: PurchaseLineItemType.EXTRANEOUS,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(1);
        expect(body[0].id).toBeDefined();
        expect(body[0].description).toBe(lineItemBody[0].description);
        expect(body[0].quickBooksId).toBe(lineItemBody[0].quickBooksId);
        expect(body[0].purchaseId).toBe(lineItemBody[0].purchaseId);
        expect(body[0].amountCents).toBe(lineItemBody[0].amountCents);
        expect(body[0].category).toBe(lineItemBody[0].category);
        expect(body[0].type).toBe(lineItemBody[0].type);
        expect(body[0].dateCreated).toBeDefined();
        expect(body[0].lastUpdated).toBeDefined();
    });

    test("POST /purchase/line - Create Multiple Line Items", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemsBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Supplies",
                type: PurchaseLineItemType.EXTRANEOUS,
            },
            {
                description: "Software License",
                quickBooksId: 102,
                purchaseId: purchase.id,
                amountCents: 15000,
                category: "Software",
                type: PurchaseLineItemType.TYPICAL,
            },
            {
                description: "Equipment",
                quickBooksId: 103,
                purchaseId: purchase.id,
                amountCents: 25000,
                category: "Hardware",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemsBody);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(3);

        body.forEach((item: any, index: number) => {
            expect(item.id).toBeDefined();
            expect(item.description).toBe(lineItemsBody[index].description);
            expect(item.quickBooksId).toBe(lineItemsBody[index].quickBooksId);
            expect(item.amountCents).toBe(lineItemsBody[index].amountCents);
            expect(item.category).toBe(lineItemsBody[index].category);
            expect(item.type).toBe(lineItemsBody[index].type);
        });
    });

    test("POST /purchase/line - Update Existing Line Item", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        // Create initial line item
        const initialBody = [
            {
                description: "Initial Description",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Supplies",
                type: PurchaseLineItemType.EXTRANEOUS,
            },
        ];

        const createResponse = await createPurchaseLineItems(initialBody);
        const createdItem = (await createResponse.json())[0];

        // Update the line item
        const updateBody = [
            {
                id: createdItem.id,
                description: "Updated Description",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 7500,
                category: "Updated Supplies",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const updateResponse = await createPurchaseLineItems(updateBody);

        expect(updateResponse.status).toBe(200);
        const updatedItem = (await updateResponse.json())[0];
        expect(updatedItem.id).toBe(createdItem.id);
        expect(updatedItem.description).toBe("Updated Description");
        expect(updatedItem.amountCents).toBe(7500);
        expect(updatedItem.category).toBe("Updated Supplies");
        expect(updatedItem.type).toBe(PurchaseLineItemType.TYPICAL);
    });

    test("POST /purchase/line - Zero Amount", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Zero Cost Item",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 0,
                category: "Free",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].amountCents).toBe(0);
    });

    test("POST /purchase/line - Missing Required Field (description)", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Supplies",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody as any);

        expect(response.status).toBe(400);
    });

    test("POST /purchase/line - Missing Required Field (purchaseId)", async () => {
        const lineItemBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                amountCents: 5000,
                category: "Supplies",
                type: "EMPLOYEE" as const,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody as any);

        expect(response.status).toBe(400);
    });

    test("POST /purchase/line - Invalid Type Enum", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Supplies",
                type: "INVALID_TYPE",
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody as any);

        expect(response.status).toBe(400);
    });

    test("POST /purchase/line - Negative Amount", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: -5000,
                category: "Supplies",
                type: PurchaseLineItemType.EXTRANEOUS,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect(response.status).toBe(400);
    });

    test("POST /purchase/line - Empty Array", async () => {
        const response = await createPurchaseLineItems([]);

        expect(response.status).toBe(400);
    });

    test("POST /purchase/line - Empty String Fields", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect(response.status).toBe(400);
    });

    test("POST /purchase/line - Non-Existent Purchase ID", async () => {
        const lineItemBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                purchaseId: "111e99a6-d082-4327-9843-97fd228d4d37",
                amountCents: 5000,
                category: "Supplies",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect(response.status).toBe(500);
    });

    test("POST /purchase/line - Invalid Purchase ID Format", async () => {
        const lineItemBody = [
            {
                description: "Office Supplies",
                quickBooksId: 101,
                purchaseId: "invalid-uuid",
                amountCents: 5000,
                category: "Supplies",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect(response.status).toBe(500);
    });

    test("POST /purchase/line - Very Long Description", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "A".repeat(10000),
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Supplies",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect([200, 400]).toContain(response.status);
    });

    test("POST /purchase/line - Large Amount Value", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Expensive Item",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 999999999999,
                category: "High Value",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect([200, 400]).toContain(response.status);
    });

    test("POST /purchase/line - Special Characters in Description", async () => {
        const company = await createCompany();
        const purchase = await createPurchase(company.id);

        const lineItemBody = [
            {
                description: "Office Supplies @#$%^&*() with special chars",
                quickBooksId: 101,
                purchaseId: purchase.id,
                amountCents: 5000,
                category: "Supplies & Equipment",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemBody);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].description).toBe(lineItemBody[0].description);
    });

    test("POST /purchase/line - Multiple Purchases Line Items", async () => {
        const company = await createCompany();
        const purchase1 = await createPurchase(company.id);
        const purchase2 = await createPurchase(company.id);

        const lineItemsBody = [
            {
                description: "Item for Purchase 1",
                quickBooksId: 101,
                purchaseId: purchase1.id,
                amountCents: 5000,
                category: "Category A",
                type: PurchaseLineItemType.TYPICAL,
            },
            {
                description: "Item for Purchase 2",
                quickBooksId: 102,
                purchaseId: purchase2.id,
                amountCents: 7500,
                category: "Category B",
                type: PurchaseLineItemType.TYPICAL,
            },
        ];

        const response = await createPurchaseLineItems(lineItemsBody);

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.length).toBe(2);
        expect(body[0].purchaseId).toBe(purchase1.id);
        expect(body[1].purchaseId).toBe(purchase2.id);
    });
});
