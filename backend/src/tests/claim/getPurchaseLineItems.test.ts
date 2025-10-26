import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { initTestData } from "./setup";
import { DataSource } from "typeorm";
import { TESTING_PREFIX } from "../../utilities/constants";
import { Claim } from "../../entities/Claim";
import { PurchaseLineItemSeeder, seededPurchaseLineItems } from "../../database/seeds/purchaseLineItem.seed";
import { PurchaseSeeder } from "../../database/seeds/purchase.seed";
import { SeederFactoryManager } from "typeorm-extension";

describe("GET /claims/{id}/line-item - Get Linked Line Items", () => {
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

    test("GET /claims/{id}/line-item - Successfully gets linked line items", async () => {
        await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .add([seededPurchaseLineItems[0].id, seededPurchaseLineItems[1].id]);

        const response = await app.request(TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(2);

        const returnedIds = data.map((item: any) => item.id);
        expect(returnedIds).toContain(seededPurchaseLineItems[0].id);
        expect(returnedIds).toContain(seededPurchaseLineItems[1].id);

        expect(data[0]).toHaveProperty("id");
        expect(data[0]).toHaveProperty("purchaseId");
        expect(data[0]).toHaveProperty("amountCents");
        expect(data[0]).toHaveProperty("type");
        expect(data[0]).toHaveProperty("dateCreated");
        expect(data[0]).toHaveProperty("lastUpdated");
    });

    test("GET /claims/{id}/line-item - Claim with no linked line items returns empty array", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/2c24c901-38e4-4a35-a1c6-140ce64edf2a/line-item", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual([]);
        expect(data.length).toBe(0);
    });

    test("GET /claims/{id}/line-item - Claim does not exist", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/00000000-0000-0000-0000-000000000000/line-item", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        expect(response.status).toBe(404);
    });

    test("GET /claims/{id}/line-item - Invalid claim UUID format", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/invalid-uuid/line-item", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        expect(response.status).toBe(400);
    });

    test("GET /claims/{id}/line-item - Empty claim ID", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims//line-item", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        expect(response.status).toBe(404);
    });

    test("GET /claims/{id}/line-item - Multiple line items from different purchases", async () => {
        // Link items from seededPurchases[0] (has 2 items)
        await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("5efc380b-e527-4b8d-a784-5c2cc68eba87")
            .add([seededPurchaseLineItems[0].id, seededPurchaseLineItems[1].id]);

        const response = await app.request(TESTING_PREFIX + "/claims/5efc380b-e527-4b8d-a784-5c2cc68eba87/line-item", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(2);
    });
});
