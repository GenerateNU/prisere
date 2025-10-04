import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { beforeEach } from "node:test";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import CompanySeeder from "../../database/seeds/company.seed";
import InvoiceSeeder from "../../database/seeds/invoice.seed";

describe("POST /quickbooks/invoice/bulk", () => {
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

        const invoiceSeeder = new InvoiceSeeder();
        await invoiceSeeder.run(datasource, {} as SeederFactoryManager);
    })

    afterEach(async () => {
        backup.restore();
    });

    test("POST /quickbooks/invoice/bulk - All Fields Given, single creation", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // from the company seeder
                quickbooksId: 12,
                totalAmountCents: 4004,
                dateCreated: new Date().toISOString(),
            }
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        compareRequestToCreated(requestBody, body);
        
    });

    test("POST /quickbooks/invoice/bulk - All Fields Given, multiple creations", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // from the company seeder
                quickbooksId: 13,
                totalAmountCents: 4004,
                dateCreated: new Date().toISOString(),
            },
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // from the company seeder
                quickbooksId: 14,
                totalAmountCents: 0,
                dateCreated: new Date().toISOString(),
            }
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        compareRequestToCreated(requestBody, body);
        
    });

    test("POST /quickbooks/invoice/bulk - MIssing quickbooksId, multiple creations", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // from the company seeder
                totalAmountCents: 4004,
                dateCreated: new Date().toISOString(),
            },
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // from the company seeder
                totalAmountCents: 0,
                dateCreated: new Date().toISOString(),
            }
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        compareRequestToCreated(requestBody, body);
        
    });

    test("POST /quickbooks/invoice/bulk - Missing Fields, multiple creations", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                quickbooksId: 13,
                dateCreated: new Date().toISOString(),
            },
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                quickbooksId: 14,
                totalAmountCents: 0,
                dateCreated: new Date().toISOString(),
            }
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe( "✖ Invalid input: expected number, received undefined\n  → at [0].totalAmountCents");
    });

    test("POST /quickbooks/invoice/bulk - Missing Fields 2, multiple creations", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                quickbooksId: 13,
                totalAmountCents: 998,
                dateCreated: new Date().toISOString(),
            },
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838"
            }
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe( "✖ Invalid input: expected number, received undefined\n  → at [1].totalAmountCents");
    });

    test("POST /quickbooks/invoice/bulk - Single Bad company ID", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-9999-4999-9999-ffc73522a838", // bad UUID
                quickbooksId: 13,
                totalAmountCents: 11,
                dateCreated: new Date().toISOString(),
            },
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Companies not found: " + requestBody[0].companyId);
    });

    test("POST /quickbooks/invoice/bulk - Invalid and Bad company IDs", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-9999-4999-9999-ffc73522a838", // bad UUID
                quickbooksId: 13,
                totalAmountCents: 11,
                dateCreated: new Date().toISOString(),
            },
            {
                companyId: "ffc8243b-9999-9999", // invalid UUID
                quickbooksId: 15,
                totalAmountCents: 11,
                dateCreated: new Date().toISOString(),
            },
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
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
        expect(body.error).toBe("Invalid uuid format: " + requestBody[1].companyId);
    });

    test("POST /quickbooks/invoice/bulk - Some Bad company ID and some good", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-9999-4999-9999-ffc73522a838", // bad UUID
                quickbooksId: 13,
                totalAmountCents: 11,
                dateCreated: new Date().toISOString(),
            },
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // good UUID
                quickbooksId: 15,
                totalAmountCents: 11,
                dateCreated: new Date().toISOString(),
            },
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Companies not found: " + requestBody[0].companyId);
    });

    test("POST /quickbooks/invoice/bulk - Bad quickbooks ID", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // good UUID
                quickbooksId: -15,
                totalAmountCents: 11,
                dateCreated: new Date().toISOString(),
            },
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
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

    test("POST /quickbooks/invoice/bulk - Bad total cents", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // good UUID
                quickbooksId: 15,
                totalAmountCents: -11,
                dateCreated: new Date().toISOString(),
            },
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("✖ Too small: expected number to be >=0\n  → at [0].totalAmountCents");
    });

    test("POST /quickbooks/invoice/bulk - updating invoice instance", async () => {
        const requestBody = [
            {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838", // good UUID
                quickbooksId: 1, // already exists from the seeded example
                totalAmountCents: 999999,
                dateCreated: new Date().toISOString(),
            },
        ];
        const response = await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        compareRequestToCreated(requestBody, body);
    });
});


function compareRequestToCreated(requestBody: any[], response: any[]) {
    expect(response.length).toBe(requestBody.length);
    for (let b = 0; b < response.length; b++) {
        const responseElem = response[b];
        const requestElem = requestBody[b];
        expect(responseElem.companyId).toBe(requestElem.companyId);
        // compare that the days are the same (actual timestamp will be different)
        expect(new Date(responseElem.lastUpdated).toISOString().split('T')[0]).toBe(new Date().toISOString().split('T')[0]);
        expect(responseElem.totalAmountCents).toBe(requestElem.totalAmountCents);
        expect(new Date(responseElem.dateCreated).toISOString()).toBe(new Date(requestElem.dateCreated).toISOString());

        if (requestElem.quickbooksId) {
            expect(responseElem.quickbooksId).toBe(requestElem.quickbooksId);
        }
    }
}