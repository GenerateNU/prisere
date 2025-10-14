import { beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import { GetPurchaseLineItemResponseSchema } from "../../modules/purchase-line-item/types";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import { PurchaseSeeder } from "../../database/seeds/purchase.seed";
import { randomUUIDv7 } from "bun";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../database/seeds/company.seed";
import { DataSource } from "typeorm";
import { PurchaseLineItemSeeder, seededPurchaseLineItems } from "../../database/seeds/purchaseLineItem.seed";
import { beforeEach } from "node:test";

describe("Get single purchase line item", () => {
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
        backup.restore();
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

        const purchaseSeeder = new PurchaseSeeder();
        await purchaseSeeder.run(datasource, {} as SeederFactoryManager);

        const purchaseLineItemSeeder = new PurchaseLineItemSeeder();
        await purchaseLineItemSeeder.run(datasource, {} as SeederFactoryManager);
    });

    it("should return a purchase line item by id", async () => {
        const createdItem = seededPurchaseLineItems[0];

        const response = await app.request(`/purchase/line/${createdItem.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(() => GetPurchaseLineItemResponseSchema.parse(responseBody)).not.toThrow();
        expect(responseBody.id).toBe(createdItem.id);
        expect(responseBody.description).toBe(seededPurchaseLineItems[0].description);
        expect(responseBody.amountCents).toBe(seededPurchaseLineItems[0].amountCents);
    });

    it("should return 404 for non-existent line item", async () => {
        const nonExistentId = randomUUIDv7();
        const response = await app.request(`/purchase/line/${nonExistentId}`, {
            method: "GET",
        });

        expect(response.status).toBe(404);
        const responseBody = await response.json();
        expect(responseBody.error).toBeDefined();
    });

    it("should return 400 for invalid id format", async () => {
        const response = await app.request("/purchase/line/invalid-id", {
            method: "GET",
        });

        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toBeDefined();
    });
});
