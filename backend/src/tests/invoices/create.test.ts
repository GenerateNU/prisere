import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { beforeEach } from "node:test";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import CompanySeeder from "../../database/seeds/company.seed";
import { InvoiceSeeder } from "../../database/seeds/invoice.seed";
import { CompareRequestToCreated } from "./utils";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("POST /quickbooks/invoice/bulk", () => {
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
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /quickbooks/invoice/bulk - All Fields Given, single creation", async () => {
        const requestBody = [
            {
                quickbooksId: 12,
                totalAmountCents: 4004,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(
            [
                {
                    companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                    quickbooksId: 12,
                    totalAmountCents: 4004,
                    quickbooksDateCreated: quickbooksDateCreatedEx,
                },
            ],
            body
        );
    });

    test("POST /quickbooks/invoice/bulk - All Fields Given, multiple creations", async () => {
        const requestBody = [
            {
                quickbooksId: 13,
                totalAmountCents: 4004,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                quickbooksId: 14,
                totalAmountCents: 0,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(
            [
                {
                    companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                    quickbooksId: 13,
                    totalAmountCents: 4004,
                    quickbooksDateCreated: quickbooksDateCreatedEx,
                },
                {
                    companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                    quickbooksId: 14,
                    totalAmountCents: 0,
                    quickbooksDateCreated: quickbooksDateCreatedEx,
                },
            ],
            body
        );
    });

    test("POST /quickbooks/invoice/bulk - MIssing quickbooksId, multiple creations", async () => {
        const requestBody = [
            {
                totalAmountCents: 4004,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                totalAmountCents: 0,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(
            [
                {
                    companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                    totalAmountCents: 4004,
                    quickbooksDateCreated: quickbooksDateCreatedEx,
                },
                {
                    companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                    totalAmountCents: 0,
                    quickbooksDateCreated: quickbooksDateCreatedEx,
                },
            ],
            body
        );
    });

    test("POST /quickbooks/invoice/bulk - Missing Fields, multiple creations", async () => {
        const requestBody = [
            {
                quickbooksId: 13,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {
                quickbooksId: 14,
                totalAmountCents: 0,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("✖ Invalid input: expected number, received undefined\n  → at [0].totalAmountCents");
    });

    test("POST /quickbooks/invoice/bulk - Missing Fields 2, multiple creations", async () => {
        const requestBody = [
            {
                quickbooksId: 13,
                totalAmountCents: 998,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
            {},
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("✖ Invalid input: expected number, received undefined\n  → at [1].totalAmountCents");
    });

    test("POST /quickbooks/invoice/bulk - Single Bad company ID", async () => {
        const requestBody = [
            {
                quickbooksId: 13,
                totalAmountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-9999-4999-9999-ffc73522a838",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Companies not found: " + "ffc8243b-9999-4999-9999-ffc73522a838");
    });

    test("POST /quickbooks/invoice/bulk - Bad quickbooks ID", async () => {
        const requestBody = [
            {
                quickbooksId: -15,
                totalAmountCents: 11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
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
                quickbooksId: 15,
                totalAmountCents: -11,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
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
                quickbooksId: 1, // already exists from the seeded example
                totalAmountCents: 999999,
                quickbooksDateCreated: quickbooksDateCreatedEx,
            },
        ];
        const response = await app.request(TESTING_PREFIX + "/invoice/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        CompareRequestToCreated(
            [
                {
                    companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                    quickbooksId: 1, // already exists from the seeded example
                    totalAmountCents: 999999,
                    quickbooksDateCreated: quickbooksDateCreatedEx,
                },
            ],
            body
        );
    });
});
