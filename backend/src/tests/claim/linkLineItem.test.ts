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

describe("POST /claims/line-item - Link Single Line Item", () => {
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

    test("POST /claims/line-item - Successfully links line item to claim", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                purchaseLineItemId: seededPurchaseLineItems[0].id,
            }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.claimId).toBe("0174375f-e7c4-4862-bb9f-f58318bb2e7d");
        expect(data.purchaseLineItemId).toBe(seededPurchaseLineItems[0].id);

        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .loadMany();

        expect(linkedItems.length).toBe(1);
        expect(linkedItems[0].id).toBe(seededPurchaseLineItems[0].id);
    });

    test("POST /claims/line-item - Link multiple line items to same claim", async () => {
        // Link first item
        await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "2c24c901-38e4-4a35-a1c6-140ce64edf2a",
                purchaseLineItemId: seededPurchaseLineItems[0].id,
            }),
        });

        // Link second item
        await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "2c24c901-38e4-4a35-a1c6-140ce64edf2a",
                purchaseLineItemId: seededPurchaseLineItems[1].id,
            }),
        });

        // Verify exactly these 2 items were linked
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("2c24c901-38e4-4a35-a1c6-140ce64edf2a")
            .loadMany();

        expect(linkedItems.length).toBe(2);
        const linkedIds = linkedItems.map((item) => item.id);
        expect(linkedIds).toContain(seededPurchaseLineItems[0].id);
        expect(linkedIds).toContain(seededPurchaseLineItems[1].id);
    });

    test("POST /claims/line-item - Link same line item twice", async () => {
        // Link first time
        await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "37d07be0-4e09-4e70-a395-c1464f408c1f",
                purchaseLineItemId: seededPurchaseLineItems[0].id,
            }),
        });

        // Link second time (duplicate)
        await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "37d07be0-4e09-4e70-a395-c1464f408c1f",
                purchaseLineItemId: seededPurchaseLineItems[0].id,
            }),
        });

        // Verify only 1 link exists (not duplicated)
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("37d07be0-4e09-4e70-a395-c1464f408c1f")
            .loadMany();

        expect(linkedItems.length).toBe(1);
        expect(linkedItems[0].id).toBe(seededPurchaseLineItems[0].id);
    });

    test("POST /claims/line-item - Claim does not exist", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "00000000-0000-0000-0000-000000000000",
                purchaseLineItemId: seededPurchaseLineItems[0].id,
            }),
        });

        expect(response.status).toBe(404);
    });

    test("POST /claims/line-item - Line item does not exist", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                purchaseLineItemId: "00000000-0000-0000-0000-000000000000",
            }),
        });

        expect(response.status).toBe(404);
    });

    test("POST /claims/line-item - Invalid claimId UUID format", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "invalid-uuid",
                purchaseLineItemId: seededPurchaseLineItems[0].id,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item - Invalid purchaseLineItemId UUID format", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                purchaseLineItemId: "not-a-uuid",
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item - Missing claimId", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                purchaseLineItemId: seededPurchaseLineItems[0].id,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item - Missing purchaseLineItemId", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item - Empty body", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/line-item", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    });
});
