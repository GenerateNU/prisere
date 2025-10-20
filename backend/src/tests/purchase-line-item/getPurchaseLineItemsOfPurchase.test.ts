import { afterEach, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import { PurchaseSeeder, seededPurchases } from "../../database/seeds/purchase.seed";
import CompanySeeder from "../../database/seeds/company.seed";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { PurchaseLineItemSeeder } from "../../database/seeds/purchaseLineItem.seed";
import { uuidv4 } from "zod";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("Get purchase line items for a purchase", () => {
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

    it("should return all line items for a purchase", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase/${seededPurchases[0].id}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBe(2);
        expect(responseBody[0].id, "bf4c21aa-da49-42cc-9a50-749e70786f9f");
        expect(responseBody[1].id, "ba4635bf-d3ac-4d11-ac0e-82e658a96d5a");
    });

    it("should return 400 for a non existant purchase", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase/${uuidv4()}/lines`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });
});
