import { afterEach, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import {
    CreateOrChangePurchaseLineItemsDTO,
    CreateOrChangePurchaseLineItemsResponseSchema,
} from "../../modules/purchase-line-item/types";
import { PurchaseLineItemType } from "../../entities/PurchaseLineItem";
import { PurchaseSeeder, seededPurchases } from "../../database/seeds/purchase.seed";
import { randomUUIDv7 } from "bun";
import { LINE_ITEM_CATEGORY_CHARS, LINE_ITEM_DESCRIPTION_CHARS, TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { PurchaseLineItemSeeder, seededPurchaseLineItems } from "../../database/seeds/purchaseLineItem.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

describe("Create or update purchase line items", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

        const purchaseSeeder = new PurchaseSeeder();
        await purchaseSeeder.run(datasource, {} as SeederFactoryManager);

        const purchaseLineItemSeeder = new PurchaseLineItemSeeder();
        await purchaseLineItemSeeder.run(datasource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    it("should create a single purchase line item", async () => {
        const lineItemData = {
            items: [
                {
                    description: "New line item",
                    quickBooksId: 12345,
                    purchaseId: seededPurchases[0].id,
                    amountCents: 9999,
                    category: "Test Category",
                    type: PurchaseLineItemType.TYPICAL,
                    quickbooksDateCreated: new Date("2025-01-15T10:00:00Z").toISOString(),
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(() => CreateOrChangePurchaseLineItemsResponseSchema.parse(responseBody)).not.toThrow();
        expect(responseBody.length).toBe(1);
        expect(responseBody[0].description).toBe(lineItemData.items[0].description);
        expect(responseBody[0].purchaseId).toBe(lineItemData.items[0].purchaseId);
        expect(responseBody[0].amountCents).toBe(lineItemData.items[0].amountCents);
        expect(responseBody[0].type).toBe(lineItemData.items[0].type);
    });

    it("should create multiple purchase line items", async () => {
        const lineItemsData = {
            items: [
                {
                    description: "Item 1",
                    purchaseId: seededPurchases[0].id,
                    amountCents: 1000,
                    category: "Category 1",
                    type: PurchaseLineItemType.TYPICAL,
                },
                {
                    description: "Item 2",
                    purchaseId: seededPurchases[1].id,
                    amountCents: 2000,
                    category: "Category 2",
                    type: PurchaseLineItemType.EXTRANEOUS,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemsData),
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.length).toBe(2);
        expect(responseBody[0].description).toBe(lineItemsData.items[0].description);
        expect(responseBody[1].description).toBe(lineItemsData.items[1].description);
    });

    it("should create line item with optional fields omitted", async () => {
        const lineItemData = {
            items: [
                {
                    purchaseId: seededPurchases[0].id,
                    amountCents: 5000,
                    type: PurchaseLineItemType.TYPICAL,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.length).toBe(1);
        expect(responseBody[0].purchaseId).toBe(lineItemData.items[0].purchaseId);
        expect(responseBody[0].amountCents).toBe(lineItemData.items[0].amountCents);
    });

    it("should reject empty array", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: [] }),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("array to have >=1 items");
    });

    it("should reject description exceeding max characters", async () => {
        const longDescription = "a".repeat(LINE_ITEM_DESCRIPTION_CHARS + 1);
        const lineItemData = {
            items: [
                {
                    description: longDescription,
                    purchaseId: seededPurchases[0].id,
                    amountCents: 1000,
                    type: PurchaseLineItemType.TYPICAL,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain(`Description must be at most ${LINE_ITEM_DESCRIPTION_CHARS} characters`);
    });

    it("should reject category exceeding max characters", async () => {
        const longCategory = "a".repeat(LINE_ITEM_CATEGORY_CHARS + 1);
        const lineItemData = {
            items: [
                {
                    category: longCategory,
                    purchaseId: seededPurchases[0].id,
                    amountCents: 1000,
                    type: PurchaseLineItemType.TYPICAL,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain(`Category must be at most ${LINE_ITEM_CATEGORY_CHARS} characters`);
    });

    it("should reject negative amount", async () => {
        const lineItemData = {
            items: [
                {
                    purchaseId: seededPurchases[0].id,
                    amountCents: -100,
                    type: PurchaseLineItemType.TYPICAL,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("expected number to be >=0");
    });

    it("should reject empty purchaseId", async () => {
        const lineItemData = {
            items: [
                {
                    purchaseId: "",
                    amountCents: 1000,
                    type: PurchaseLineItemType.TYPICAL,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("expected string to have >=1 characters");
    });

    it("should reject invalid type", async () => {
        const lineItemData = {
            items: [
                {
                    purchaseId: seededPurchases[0].id,
                    amountCents: 1000,
                    type: "INVALID_TYPE",
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain(`expected one of "extraneous"|"typical"`);
    });

    it("should reject non-existent purchaseId", async () => {
        const lineItemData = {
            items: [
                {
                    purchaseId: randomUUIDv7(),
                    amountCents: 1000,
                    type: PurchaseLineItemType.TYPICAL,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(lineItemData),
        });

        expect(response.status).toBe(404);
        const responseBody = await response.json();
        expect(responseBody.error).toBeDefined();
    });

    it("should update existing line item when posted with same id", async () => {
        const createdItem = seededPurchaseLineItems[0];

        const updatedData = {
            items: [
                {
                    quickBooksId: createdItem.quickBooksId,
                    purchaseId: seededPurchases[0].id,
                    amountCents: 2000,
                    category: "Updated Category",
                    type: PurchaseLineItemType.EXTRANEOUS,
                },
            ],
        };

        const updateResponse = await app.request(TESTING_PREFIX + "/purchase/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        });

        expect(updateResponse.status).toBe(200);
        const responseBody = await updateResponse.json();
        expect(responseBody[0].id).toBe(createdItem.id);
        expect(responseBody[0].amountCents).toBe(2000);
        expect(responseBody[0].category).toBe("Updated Category");
        expect(responseBody[0].type).toBe(PurchaseLineItemType.EXTRANEOUS);
    });
});
