import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { initTestData } from "../claim/setup";
import { DataSource } from "typeorm";
import { TESTING_PREFIX } from "../../utilities/constants";
import { PurchaseLineItemSeeder, seededPurchaseLineItems } from "../../database/seeds/purchaseLineItem.seed";
import { PurchaseSeeder } from "../../database/seeds/purchase.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { PurchaseLineItem, PurchaseLineItemType } from "../../entities/PurchaseLineItem";

describe("PATCH /purchase/category - Update Purchase Line Item Category", () => {
    let app: Hono;
    let backup: IBackup;
    let testAppDataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        testAppDataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        await initTestData(testAppDataSource);

        const purchaseSeeder = new PurchaseSeeder();
        await purchaseSeeder.run(testAppDataSource, {} as SeederFactoryManager);

        const purchaseLineItemSeeder = new PurchaseLineItemSeeder();
        await purchaseLineItemSeeder.run(testAppDataSource, {} as SeederFactoryManager);
    });

    afterEach(() => {
        backup.restore();
    });

    test("PATCH /purchase/category - Successfully updates category", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: "Office Supplies",
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(seededPurchaseLineItems[0].id);
        expect(data.category).toBe("Office Supplies");

        const updatedItem = await testAppDataSource.manager.findOne(PurchaseLineItem, {
            where: { id: seededPurchaseLineItems[0].id },
        });
        expect(updatedItem?.category).toBe("Office Supplies");
    });

    test("PATCH /purchase/category - Tries to update category to empty string", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: "",
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/category - Invalid UUID format", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: "invalid-uuid",
                category: "New Category",
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/category - Missing id", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                category: "New Category",
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/category - Missing category", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/category - Category exceeds max length", async () => {
        const longCategory = "a".repeat(300);
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: longCategory,
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/category - Empty body", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/category - Category with special characters", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: "Office & Supplies - 2024 (Q1)",
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.category).toBe("Office & Supplies - 2024 (Q1)");
    });

    test("PATCH /purchase/category - Multiple updates to same item", async () => {
        await app.request(TESTING_PREFIX + "/purchase/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: "First Category",
                removeCategory: false,
            }),
        });

        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: "Second Category",
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.category).toBe("Second Category");
    });


    test("PATCH /purchase/category - Successfully updates category then removes", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: "Office Supplies",
                removeCategory: false,
            }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(seededPurchaseLineItems[0].id);
        expect(data.category).toBe("Office Supplies");

        const updatedItem = await testAppDataSource.manager.findOne(PurchaseLineItem, {
            where: { id: seededPurchaseLineItems[0].id },
        });

        expect(updatedItem?.category).toBe("Office Supplies");

        const removeResponse = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                category: "Office Supplies",
                removeCategory: true,
            }),
        });

        expect(removeResponse.status).toBe(200);
        const updatedItemAfterRemove = await testAppDataSource.manager.findOne(PurchaseLineItem, {
            where: { id:  seededPurchaseLineItems[0].id },
        });

        expect(updatedItemAfterRemove).not.toBeNull();
        expect(updatedItemAfterRemove?.category).toBeNull();

    });


    test("PATCH /purchase/category - Does not remove category when category does not match", async () => {
        const lineItemId = seededPurchaseLineItems[0].id;

        const setResponse = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: lineItemId,
                category: "Keep Me",
                removeCategory: false,
            }),
        });

        expect(setResponse.status).toBe(200);

        const removeResponse = await app.request(TESTING_PREFIX + "/purchase/line/category", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: lineItemId,
                category: "Other Category",
                removeCategory: true,
            }),
        });

        expect(removeResponse.status).toBe(200);

        const updatedItem = await testAppDataSource.manager.findOne(PurchaseLineItem, {
            where: { id: lineItemId },
        });

        expect(updatedItem).not.toBeNull();
        expect(updatedItem?.category).toBe("Keep Me");
    });
});

describe("PATCH /purchase/type - Update Purchase Line Item Type", () => {
    let app: Hono;
    let backup: IBackup;
    let testAppDataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        testAppDataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        await initTestData(testAppDataSource);

        const purchaseSeeder = new PurchaseSeeder();
        await purchaseSeeder.run(testAppDataSource, {} as SeederFactoryManager);

        const purchaseLineItemSeeder = new PurchaseLineItemSeeder();
        await purchaseLineItemSeeder.run(testAppDataSource, {} as SeederFactoryManager);
    });

    afterEach(() => {
        backup.restore();
    });

    test("PATCH /purchase/type - Successfully updates type to EXTRANEOUS", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                type: PurchaseLineItemType.EXTRANEOUS,
            }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(seededPurchaseLineItems[0].id);
        expect(data.type).toBe(PurchaseLineItemType.EXTRANEOUS);

        const updatedItem = await testAppDataSource.manager.findOne(PurchaseLineItem, {
            where: { id: seededPurchaseLineItems[0].id },
        });
        expect(updatedItem?.type).toBe(PurchaseLineItemType.EXTRANEOUS);
    });

    test("PATCH /purchase/type - Successfully updates type to TYPICAL", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[1].id,
                type: PurchaseLineItemType.TYPICAL,
            }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(seededPurchaseLineItems[1].id);
        expect(data.type).toBe(PurchaseLineItemType.TYPICAL);

        const updatedItem = await testAppDataSource.manager.findOne(PurchaseLineItem, {
            where: { id: seededPurchaseLineItems[1].id },
        });
        expect(updatedItem?.type).toBe(PurchaseLineItemType.TYPICAL);
    });

    test("PATCH /purchase/type - Purchase line item does not exist", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: "00000000-0000-0000-0000-000000000000",
                type: PurchaseLineItemType.TYPICAL,
            }),
        });

        expect(response.status).toBe(404);
    });

    test("PATCH /purchase/type - Invalid UUID format", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: "not-a-valid-uuid",
                type: PurchaseLineItemType.TYPICAL,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/type - Invalid type value", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                type: "INVALID_TYPE",
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/type - Missing id", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: PurchaseLineItemType.TYPICAL,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/type - Missing type", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/type - Empty body", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/type - Type as null", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                type: null,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/type - Type as number", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                type: 123,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("PATCH /purchase/type - Multiple updates to same item", async () => {
        await app.request(TESTING_PREFIX + "/purchase/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                type: PurchaseLineItemType.TYPICAL,
            }),
        });

        const response = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                type:PurchaseLineItemType.EXTRANEOUS,
            }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.type).toBe(PurchaseLineItemType.EXTRANEOUS);
    });

    test("PATCH /purchase/type - Update different items", async () => {
        const response1 = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[0].id,
                type: PurchaseLineItemType.EXTRANEOUS,
            }),
        });

        const response2 = await app.request(TESTING_PREFIX + "/purchase/line/type", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: seededPurchaseLineItems[1].id,
                type: PurchaseLineItemType.TYPICAL,
            }),
        });

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

        const data1 = await response1.json();
        const data2 = await response2.json();

        expect(data1.id).toBe(seededPurchaseLineItems[0].id);
        expect(data1.type).toBe(PurchaseLineItemType.EXTRANEOUS);
        expect(data2.id).toBe(seededPurchaseLineItems[1].id);
        expect(data2.type).toBe(PurchaseLineItemType.TYPICAL);
    });
});