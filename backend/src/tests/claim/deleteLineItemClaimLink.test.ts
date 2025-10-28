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
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";

describe("DELETE /claims/{claimId}/line-item/{lineItemId} - Remove Link", () => {
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

        await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .add([seededPurchaseLineItems[0].id, seededPurchaseLineItems[1].id]);
    });

    afterEach(() => {
        backup.restore();
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Successfully removes link", async () => {
        const response = await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.claimId).toBe("0174375f-e7c4-4862-bb9f-f58318bb2e7d");
        expect(data.purchaseLineItemId).toBe(seededPurchaseLineItems[0].id);

        // Verify link was removed
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .loadMany();

        expect(linkedItems.length).toBe(1);
        expect(linkedItems[0].id).toBe(seededPurchaseLineItems[1].id);
        const linkedIds = linkedItems.map((item) => item.id);
        expect(linkedIds).not.toContain(seededPurchaseLineItems[0].id);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Remove last remaining link", async () => {
        // First remove one link
        await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        // Remove second link
        const response = await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/" + seededPurchaseLineItems[1].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.claimId).toBe("0174375f-e7c4-4862-bb9f-f58318bb2e7d");
        expect(data.purchaseLineItemId).toBe(seededPurchaseLineItems[1].id);

        // Verify no links remain
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .loadMany();

        expect(linkedItems.length).toBe(0);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Link does not exist", async () => {
        const response = await app.request(
            TESTING_PREFIX + "/claims/2c24c901-38e4-4a35-a1c6-140ce64edf2a/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.claimId).toBe("2c24c901-38e4-4a35-a1c6-140ce64edf2a");
        expect(data.purchaseLineItemId).toBe(seededPurchaseLineItems[0].id);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Claim does not exist", async () => {
        const response = await app.request(
            TESTING_PREFIX + "/claims/00000000-0000-0000-0000-000000000000/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(404);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Line item does not exist", async () => {
        const response = await app.request(
            TESTING_PREFIX +
                "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/00000000-0000-0000-0000-000000000000",
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(404);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Invalid claim UUID format", async () => {
        const response = await app.request(
            TESTING_PREFIX + "/claims/invalid-uuid/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(400);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Invalid line item UUID format", async () => {
        const response = await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/not-a-uuid",
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(400);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Delete same link twice", async () => {
        // Delete first time
        const response1 = await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );
        expect(response1.status).toBe(200);

        // Delete second time (link already removed)
        const response2 = await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );
        expect(response2.status).toBe(200);
        const data = await response2.json();
        expect(data.claimId).toBe("0174375f-e7c4-4862-bb9f-f58318bb2e7d");
        expect(data.purchaseLineItemId).toBe(seededPurchaseLineItems[0].id);

        // Verify still only 1 link remains
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .loadMany();

        expect(linkedItems.length).toBe(1);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Verify line item still exists after unlink", async () => {
        // Delete the link
        const response = await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(200);

        // Verify the PurchaseLineItem entity itself still exists
        const lineItem = await testAppDataSource.getRepository(PurchaseLineItem).findOne({
            where: { id: seededPurchaseLineItems[0].id },
        });

        expect(lineItem).not.toBeNull();
        expect(lineItem?.id).toBe(seededPurchaseLineItems[0].id);
    });

    test("DELETE /claims/{claimId}/line-item/{lineItemId} - Only removes specified link, not others", async () => {
        // Delete only first link
        const response = await app.request(
            TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d/line-item/" + seededPurchaseLineItems[0].id,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        expect(response.status).toBe(200);

        // Verify second link still exists
        const linkedItems = await testAppDataSource
            .createQueryBuilder()
            .relation(Claim, "purchaseLineItems")
            .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
            .loadMany();

        expect(linkedItems.length).toBe(1);
        expect(linkedItems[0].id).toBe(seededPurchaseLineItems[1].id);
    });
});
