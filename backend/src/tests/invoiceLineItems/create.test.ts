import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { beforeEach } from "node:test";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import CompanySeeder from "../../database/seeds/company.seed";
import { InvoiceSeeder, seededInvoices } from "../../database/seeds/invoice.seed";
import { CompareRequestToCreated } from "./utils";
import { InvoiceLineItemSeeder } from "../../database/seeds/invoiceLineItem.seed";

describe("POST /quickbooks/invoice/line/bulk", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;
    const quickbooksDateCreatedEx = new Date().toISOString();

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

    test("POST /quickbooks/invoice/line/bulk - Not All Fields Given, single creation", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id,
                quickbooksId: 12,
                amountCents: 4004,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(requestBody, body);
    });

    test("POST /quickbooks/invoice/line/bulk - All Fields Given, multiple creations", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id,
                quickbooksId: 13,
                amountCents: 4004,
                quickbooksDateCreated: quickbooksDateCreatedEx,
                description: "description",
                category: "CAT1",
            },
            {
                invoiceId: seededInvoices[1].id,
                quickbooksId: 14,
                amountCents: 0,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(requestBody, body);
    });

    test("POST /quickbooks/invoice/line/bulk - MIssing quickbooksId, multiple creations", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id,
                amountCents: 4004,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                invoiceId: seededInvoices[0].id,
                amountCents: 0,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(requestBody, body);
    });

    test("POST /quickbooks/invoice/line/bulk - Missing Fields, multiple creations", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id,
                quickbooksId: 13,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                invoiceId: seededInvoices[0].id,
                quickbooksId: 14,
                amountCents: 0,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("✖ Invalid input: expected number, received undefined\n  → at [0].amountCents");
    });

    test("POST /quickbooks/invoice/line/bulk - Missing Fields 2, multiple creations", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id,
                quickbooksId: 13,
                amountCents: 998,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                invoiceId: seededInvoices[0].id,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("✖ Invalid input: expected number, received undefined\n  → at [1].amountCents");
    });

    test("POST /quickbooks/invoice/line/bulk - Single Bad invoice ID", async () => {
        const requestBody = [
            {
                invoiceId: "114ca29d-c64b-4494-b1f3-db25def57a5f", // bad UUID
                quickbooksId: 13,
                amountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invoices not found: " + requestBody[0].invoiceId);
    });

    test("POST /quickbooks/invoice/line/bulk - Invalid and Bad company IDs", async () => {
        const requestBody = [
            {
                invoiceId: "114ca29d-c64b-4494-b1f3-db25def57a5f", // bad UUID
                quickbooksId: 13,
                amountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                invoiceId: "ffc8243b-9999-9999", // invalid UUID
                quickbooksId: 15,
                amountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        // first checks for validity, then checks if they are in the DB
        expect(body.error).toBe("Invalid uuid format: " + requestBody[1].invoiceId);
    });

    test("POST /quickbooks/invoice/line/bulk - Some Bad company ID and some good", async () => {
        const requestBody = [
            {
                invoiceId: "114ca29d-c64b-4494-b1f3-db25def57a5f", // bad UUID
                quickbooksId: 13,
                amountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                invoiceId: seededInvoices[0].id,
                quickbooksId: 15,
                amountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invoices not found: " + requestBody[0].invoiceId);
    });

    test("POST /quickbooks/invoice/line/bulk - Bad quickbooks ID", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id, // good UUID
                quickbooksId: -15,
                amountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("✖ Too small: expected number to be >0\n  → at [0].quickbooksId");
    });

    test("POST /quickbooks/invoice/line/bulk - Bad total cents", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id, // good UUID
                quickbooksId: 15,
                amountCents: -11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("✖ Too small: expected number to be >=0\n  → at [0].amountCents");
    });

    test("POST /quickbooks/invoice/line/bulk - updating invoice line item instance", async () => {
        const requestBody = [
            {
                invoiceId: seededInvoices[0].id, // good UUID
                quickbooksId: 3, // already exists from the seeded example
                amountCents: 999999,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request("/quickbooks/invoice/line/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(requestBody, body);
    });
});
