import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

describe("Company - Update lastQuickBooksImportTime", () => {
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
    });

    afterEach(async () => {
        backup.restore();
    });

    test("PATCH /companies/:id/quickbooks-invoice-import-time - Valid date", async () => {
        const newDate = new Date("2025-12-25T09:30:00.000Z");
        const response = await app.request(TESTING_PREFIX + `/companies/quickbooks-invoice-import-time`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify({ importTime: newDate.toISOString() }), // <-- use importTime
        });
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.lastQuickBooksInvoiceImportTime).toBe(newDate.toISOString());
    });

    test("PATCH /companies/:id/quickbooks-invoice-import-time - Invalid date string", async () => {
        const response = await app.request(TESTING_PREFIX + `/companies/quickbooks-invoice-import-time`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify({ importTime: "not-a-date" }), // <-- use importTime
        });
        expect(response.status).toBe(400);
    });

    test("PATCH /companies/:id/quickbooks-invoice-import-time - Missing date", async () => {
        const response = await app.request(TESTING_PREFIX + `/companies/quickbooks-invoice-import-time`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });

    test("PATCH /companies/:id/quickbooks-invoice-import-time - Non-existent company", async () => {
        const newDate = new Date("2025-12-25T09:30:00.000Z");
        const response = await app.request(TESTING_PREFIX + `/companies/quickbooks-invoice-import-time`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "nonexistent-id",
            },
            body: JSON.stringify({ importTime: newDate.toISOString() }), // <-- use importTime
        });
        expect(response.status).toBe(500);
    });
});
