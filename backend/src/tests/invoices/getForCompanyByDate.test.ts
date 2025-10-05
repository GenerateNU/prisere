import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../database/seeds/company.seed";
import { InvoiceSeeder, seededInvoices } from "../../database/seeds/invoice.seed";
import { DataSource } from "typeorm";
import { CompareRequestToCreated } from "./utils";
import { validate } from "uuid";

describe("Invoice get by id", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;
    let createdCompanyId: string;


    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;

        const response = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test Company" }),
        });
        const body = await response.json();
        createdCompanyId = body.id;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("should get the invoices in the valid date range", async () => {

        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const invoices: any[] = [{
            companyId: createdCompanyId,
            totalAmountCents: 45,
            dateCreated: tenDaysAgo,
        }, {
            companyId: createdCompanyId,
            totalAmountCents: 50,
            dateCreated: fiveDaysAgo,
        }, {
            companyId: createdCompanyId,
            totalAmountCents: 50,
            dateCreated: threeDaysAgo,
        }]

        await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoices),
        });

        const response = await app.request(`/quickbooks/invoice/bulk/${createdCompanyId}?startDate=${tenDaysAgo.toISOString()}&endDate=${fiveDaysAgo.toISOString()}`);
        const body = await response.json();
        expect(response.status).toBe(200);
        CompareRequestToCreated([invoices[0], invoices[1]], body);
    });

    test("should get empty array of invoices if no invoices in the valid date range", async () => {

        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(fiveDaysAgo.getDate() - 3);

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const invoices: any[] = [{
            companyId: createdCompanyId,
            totalAmountCents: 45,
            dateCreated: tenDaysAgo,
        }, {
            companyId: createdCompanyId,
            totalAmountCents: 50,
            dateCreated: fiveDaysAgo,
        }, {
            companyId: createdCompanyId,
            totalAmountCents: 50,
            dateCreated: threeDaysAgo,
        }]

        await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoices),
        });

        const response = await app.request(`/quickbooks/invoice/bulk/${createdCompanyId}?startDate=${twoDaysAgo.toISOString()}&endDate=${new Date().toISOString()}`);
        const body = await response.json();
        expect(response.status).toBe(200);
        CompareRequestToCreated([], body);
    });

    test("should return 400 if invalid dates", async () => {

        const response = await app.request(`/quickbooks/invoice/bulk/${createdCompanyId}?startDate=${new Date().toISOString()}&endDate=${new Date().toISOString()}`);
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Start date must be before End date");
    });

    test("should return 400 if invalid companyID", async () => {

        const response = await app.request(`/quickbooks/invoice/bulk/bla?startDate=${new Date().toISOString()}&endDate=${new Date().toISOString()}`);
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid company ID format");
    });

});
