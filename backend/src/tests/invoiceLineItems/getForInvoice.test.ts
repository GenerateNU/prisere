import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../database/seeds/company.seed";
import { InvoiceSeeder, seededInvoices } from "../../database/seeds/invoice.seed";
import { DataSource } from "typeorm";
import { CompareRequestToCreated } from "./utils";
import { InvoiceLineItemSeeder, seededInvoiceLineItems } from "../../database/seeds/invoiceLineItem.seed";

describe("Invoice get by id", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;
    const seededInvoiceId = seededInvoices[0].id;

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

    test("GET /quickbooks/invoice/{id}/line - valid invoice id ", async () => {
        const response = await app.request(`/invoice/${seededInvoiceId}/lines`);

        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([seededInvoiceLineItems[0], seededInvoiceLineItems[1]], body);
    });

    test("GET /quickbooks/invoice/{id}/line - bad invoice id ", async () => {
        const response = await app.request(`/invoice/8d720d89-9999-4999-a999-1934f914907f/lines`);

        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([], body);
    });

    test("GET /quickbooks/invoice/{id}/line - invalid invoice id ", async () => {
        const response = await app.request(`/invoice/hellnah/lines`);

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid Invoice ID format");
    });
});
