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
    const seededCompanyId = seededInvoices[0].companyId;

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
    });

    afterEach(async () => {
        backup.restore();
    });

    test("GET /quickbooks/invoice - valid company id ", async () => {
        const response = await app.request(TESTING_PREFIX + `/invoice?companyId=${seededCompanyId}`);

        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated(seededInvoices, body);
    });

    test("GET /quickbooks/invoice - bad company id ", async () => {
        const response = await app.request(TESTING_PREFIX + `/invoice?companyId=8d720d89-9999-4999-a999-1934f914907f`);

        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([], body);
    });

    test("GET /quickbooks/invoice - invalid company id ", async () => {
        const response = await app.request(TESTING_PREFIX + `/invoice?companyId=hellnah`);

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid company ID format");
    });

    test("GET /quickbooks/invoice - valid company id paginated page 1", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/invoice?companyId=${seededCompanyId}&pageNumber=0&resultsPerPage=1`
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([seededInvoices[0]], body);
    });

    test("GET /quickbooks/invoice - valid company id paginated page 2", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/invoice?companyId=${seededCompanyId}&pageNumber=1&resultsPerPage=1`
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([seededInvoices[1]], body);
    });

    test("GET /quickbooks/invoice - valid company id paginated page 3", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/invoice?companyId=${seededCompanyId}&pageNumber=2&resultsPerPage=1`
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        CompareRequestToCreated([], body);
    });
});
