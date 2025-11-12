import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { PurchaseSeeder } from "../../database/seeds/purchase.seed";
import { PurchaseLineItemSeeder } from "../../database/seeds/purchaseLineItem.seed";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import CompanySeeder, { seededCompanies } from "../../database/seeds/company.seed";

describe("GET /purchase/categories - Get all categories for a company's purchases", () => {
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
        const companySeeder = new CompanySeeder();
        await companySeeder.run(testAppDataSource, {} as SeederFactoryManager);

        const purchaseSeeder = new PurchaseSeeder();
        await purchaseSeeder.run(testAppDataSource, {} as SeederFactoryManager);

        const purchaseLineItemSeeder = new PurchaseLineItemSeeder();
        await purchaseLineItemSeeder.run(testAppDataSource, {} as SeederFactoryManager);
    });

    afterEach(() => {
        backup.restore();
    });

    test("GET /purchase/categories - returns all categories for company's purchases", async () => {
        const allLineItems = await testAppDataSource.manager.find(PurchaseLineItem);
        const expectedCategories = Array.from(
            new Set(allLineItems.map((li) => li.category).filter((c): c is string => !!c))
        );

        const response = await app.request(TESTING_PREFIX + "/purchase/categories", {
            method: "GET",
            headers: { "Content-Type": "application/json", companyId: seededCompanies[0].id },
        });

        expect(response.status).toBe(200);
        const data: string[] = await response.json();

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        data.forEach((c) => expect(typeof c).toBe("string"));
        expect(data.sort()).toEqual(expectedCategories.sort());
    });

    test("GET /purchase/categories - returns empty array when company has no purchases", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/categories", {
            method: "GET",
            headers: { "Content-Type": "application/json", companyId: "5667a729-f000-4190-b4ee-7957badca27c" },
        });

        expect(response.status).toBe(200);
        const data: unknown = await response.json();

        expect(Array.isArray(data)).toBe(true);
        expect((data as unknown[]).length).toBe(0);
    });

    test("GET /purchase/categories - 400 when invalid companyId", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/categories", {
            method: "GET",
            headers: { "Content-Type": "application/json", companyId: "blabla" },
        });

        expect(response.status).toBe(400);
    });
});
