import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { initTestData } from "./setup";
import { DataSource } from "typeorm";
import { TESTING_PREFIX } from "../../utilities/constants";
import { Claim } from "../../entities/Claim";
import { PurchaseLineItemSeeder, seededPurchaseLineItems } from "../../database/seeds/purchaseLineItem.seed";
import { PurchaseSeeder, seededPurchases } from "../../database/seeds/purchase.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { Purchase } from "../../entities/Purchase";


describe("POST /claims/line-item/bulk - Link All Line Items from Purchase", () => {
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

    test("POST /claims/line-item/bulk - Successfully links all line items from purchase to claim", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                purchaseId: seededPurchases[0].id,
            }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.length).toBe(2);
        expect(data[0].claimId).toBe("0174375f-e7c4-4862-bb9f-f58318bb2e7d");

        // Verify exactly 2 line items were linked
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, 'purchaseLineItems')
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .loadMany();

        expect(linkedItems.length).toBe(2);
        const linkedIds = linkedItems.map(item => item.id);
        expect(linkedIds).toContain(seededPurchaseLineItems[0].id);
        expect(linkedIds).toContain(seededPurchaseLineItems[1].id);
    });

    test("POST /claims/line-item/bulk - Claim does not exist", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "00000000-0000-0000-0000-000000000000",
                purchaseId: seededPurchases[0].id,
            }),
        });

        expect(response.status).toBe(404);
    });

    test("POST /claims/line-item/bulk - Purchase does not exist", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                purchaseId: "00000000-0000-0000-0000-000000000000",
            }),
        });

        expect(response.status).toBe(404);
    });

    test("POST /claims/line-item/bulk - Invalid claimId UUID format", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "invalid-uuid",
                purchaseId: seededPurchases[0].id,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item/bulk - Invalid purchaseId UUID format", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                purchaseId: "not-a-uuid",
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item/bulk - Missing claimId", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                purchaseId: seededPurchases[0].id,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item/bulk - Missing purchaseId", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
            }),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item/bulk - Empty body", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims/line-item/bulk - Link all line items twice", async () => {
        // Link first time
        await app.request(TESTING_PREFIX + "/claims/line-item/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "37d07be0-4e09-4e70-a395-c1464f408c1f",
                purchaseId: seededPurchases[0].id,
            }),
        });

        // Link second time
        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "37d07be0-4e09-4e70-a395-c1464f408c1f",
                purchaseId: seededPurchases[0].id,
            }),
        });

        expect(response.status).toBe(201);

        // Verify still only 2 links (no duplicates created)
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, 'purchaseLineItems')
            .of("37d07be0-4e09-4e70-a395-c1464f408c1f")
            .loadMany();

        expect(linkedItems.length).toBe(2);
    });

    test("POST /claims/purchase - Purchase has no line items", async () => {
        // Create a purchase with no line items
        const purchaseRepo = testAppDataSource.getRepository(Purchase);
        const emptyPurchase = await purchaseRepo.save({
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            totalAmountCents: 0,
            isRefund: false,
        });

        const response = await app.request(TESTING_PREFIX + "/claims/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                purchaseId: emptyPurchase.id,
            }),
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data).toEqual([]);
        expect(data.length).toBe(0);
    });
});