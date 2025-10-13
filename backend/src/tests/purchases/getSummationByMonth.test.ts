import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { PurchaseSeeder, seededPurchases } from "../../database/seeds/purchase.seed";

describe("Get Purchase summation by company id per month", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    const seededPurchase = seededPurchases[0];
    const seededPurchaseCompany = seededPurchase.companyId;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);

        const purchaseSeeder = new PurchaseSeeder();
        await purchaseSeeder.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("should return the sum of purchases in the valid date range by month, ignoring refunded purchases", async () => {
        const response = await app.request(
            `/purchase/bulk/${seededPurchaseCompany}/months?startDate=2025-01-11T12:00:00Z&endDate=2025-04-11T12:00:00Z`
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.length).toBe(1);
        expect(body).toEqual([{
            month: "2025-01",
            total: 5678
        }])
    });

    test("should return multiple months", async () => {
        const response = await app.request(
            `/purchase/bulk/${seededPurchaseCompany}/months?startDate=2024-01-11T12:00:00Z&endDate=2025-04-11T12:00:00Z`
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.length).toBe(2);
        expect(body).toEqual([
            {
                month: "2024-04",
                total: 50
            },
            {
                month: "2025-01",
                total: 6134
            },
        ])
    });

    test("should return empty arr if no purchases in the valid date range", async () => {
        const response = await app.request(
            `/purchase/bulk/${seededPurchaseCompany}/months?startDate=2025-08-11T12:00:00Z&endDate=2025-10-11T12:00:00Z`
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body).toEqual([]);
    });

    test("should return 400 if invalid dates", async () => {
        const response = await app.request(
            `/purchase/bulk/${seededPurchaseCompany}/months?startDate=2025-04-11T12:00:00Z&endDate=2025-04-11T12:00:00Z`
        );
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Start date must be before End date");
    });

    test("should return 400 if invalid companyID", async () => {
        const response = await app.request(
            `/purchase/bulk/bla/months?startDate=2025-04-11T12:00:00Z&endDate=2025-06-11T12:00:00Z`
        );
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid company ID format");
    });
});
