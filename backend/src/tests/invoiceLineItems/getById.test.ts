import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../database/seeds/company.seed";
import { DataSource } from "typeorm";
import { CompareRequestToCreated } from "./utils";
import { InvoiceLineItemSeeder, seededInvoiceLineItems } from "../../database/seeds/invoiceLineItem.seed";
import { InvoiceSeeder } from "../../database/seeds/invoice.seed";

describe("Invoice get by id", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;
    const seededInvoiceLineItem = seededInvoiceLineItems[0];
    const seededInvoiceLineItemId = seededInvoiceLineItem.id;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

        const invoiceSeeder = new InvoiceSeeder();
        await invoiceSeeder.run(datasource, {} as SeederFactoryManager);

        const invoiceLineItemSeeder = new InvoiceLineItemSeeder();
        await invoiceLineItemSeeder.run(datasource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("GET /quickbooks/invoice/line/:id - id that exists", async () => {
        const response = await app.request(`/invoice/line/${seededInvoiceLineItemId}`);
        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([seededInvoiceLineItem], [body]);
    });

    test("GET /quickbooks/invoice/line/:id - id doesn't exist", async () => {
        const response = await app.request(`/invoice/line/8d720d89-d047-4f19-a999-1934f914908d`); // bad uuid
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("No invoice line items found with id: 8d720d89-d047-4f19-a999-1934f914908d");
    });

    test("GET /quickbooks/invoice/line/:id - invalid UUID", async () => {
        const response = await app.request(`/invoice/line/8d720d89-134f914908d`); // invalid uuid
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid invoice line item ID format");
    });
});
