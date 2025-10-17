import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { InvoiceSeeder, seededInvoices } from "../../database/seeds/invoice.seed";
import { DataSource } from "typeorm";
import { TESTING_PREFIX } from "../../utilities/constants";

describe(" Get Invoice summation by company id", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    const seededInvoice = seededInvoices[0];
    const seededInvoiceCompany = seededInvoice.companyId;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);

        const invoiceSeeder = new InvoiceSeeder();
        await invoiceSeeder.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("should return the sum of invoices in the valid date range", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/invoice/bulk/totalIncome?startDate=2025-01-11T12:00:00Z&endDate=2025-04-11T12:00:00Z`,
            {
                headers: {
                    companyId: seededInvoiceCompany,
                },
            }
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.total).toBe(279);
    });

    test("should return 0 if no invoices in the valid date range", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/invoice/bulk/totalIncome?startDate=2025-08-11T12:00:00Z&endDate=2025-10-11T12:00:00Z`,
            {
                headers: {
                    companyId: seededInvoiceCompany,
                },
            }
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.total).toBe(0);
    });

    test("should return 400 if invalid dates", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/invoice/bulk/totalIncome?startDate=2025-04-11T12:00:00Z&endDate=2025-04-11T12:00:00Z`,
            {
                headers: {
                    companyId: seededInvoiceCompany,
                },
            }
        );
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Start date must be before End date");
    });

    test("should return 400 if invalid companyID", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/invoice/bulk/totalIncome?startDate=2025-04-11T12:00:00Z&endDate=2025-06-11T12:00:00Z`,
            {
                headers: {
                    companyId: "blah",
                },
            }
        );
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid company ID format");
    });
});
