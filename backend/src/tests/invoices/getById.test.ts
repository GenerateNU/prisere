import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../database/seeds/company.seed";
import { InvoiceSeeder, seededInvoices } from "../../database/seeds/invoice.seed";
import { DataSource } from "typeorm";
import { CompareRequestToCreated } from "./utils";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("Invoice get by id", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;
    const seededInvoice = seededInvoices[0];
    const seededInvoiceId = seededInvoice.id;

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

        const invoiceSeeder = new InvoiceSeeder();
        await invoiceSeeder.run(datasource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("GET /quickbooks/invoices/:id - id that exists", async () => {
        const response = await app.request(TESTING_PREFIX + `/invoice/${seededInvoiceId}`);
        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([seededInvoice], [body]);
    });

    test("GET /quickbooks/invoices/:id - id doesn't exist", async () => {
        const response = await app.request(TESTING_PREFIX + `/invoice/8d720d89-d047-4f19-a999-1934f914908d`); // bad uuid
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("No invoices found with id: 8d720d89-d047-4f19-a999-1934f914908d");
    });

    test("GET /quickbooks/invoices/:id - invalid UUID", async () => {
        const response = await app.request(TESTING_PREFIX + `/invoice/8d720d89-134f914908d`); // invalid uuid
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid invoice ID format");
    });
});
