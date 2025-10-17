import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { CreateOrChangePurchaseRequest } from "../../modules/purchase/types";
import { TESTING_PREFIX } from "../../utilities/constants";
import { DataSource } from "typeorm";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
describe("GET /purchase/:id", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    afterEach(async () => {
        backup.restore();
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);
    });

    const createCompany = async () => {
        const companyRequest = {
            name: "Cool Company",
        };

        const createCompanyResponse = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify(companyRequest),
        });

        return await createCompanyResponse.json();
    };

    const createPurchase = async (payload: Partial<CreateOrChangePurchaseRequest>) => {
        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(payload),
        });

        return (await response.json())[0];
    };

    test("GET /purchase/:id - Valid Purchase ID", async () => {
        await createCompany();
        // First create a purchase to retrieve
        const createBody = {
            quickBooksId: 12345,
            totalAmountCents: 50000,
            isRefund: false,
        };

        const createdPurchase = await createPurchase([createBody]);

        // Now retrieve the purchase
        const response = await app.request(TESTING_PREFIX + `/purchase/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.id).toBe(createdPurchase.id);
        expect(body.quickBooksId).toBe(createBody.quickBooksId);
        expect(body.totalAmountCents).toBe(createBody.totalAmountCents);
        expect(body.isRefund).toBe(createBody.isRefund);
        expect(body.dateCreated).toBeDefined();
        expect(body.lastUpdated).toBeDefined();
    });

    test("GET /purchase/:id - Valid Purchase ID with Refund", async () => {
        await createCompany();

        // Create a refund purchase
        const createBody = {
            totalAmountCents: 25000,
            isRefund: true,
        };

        const createdPurchase = await createPurchase([createBody]);

        // Retrieve the purchase
        const response = await app.request(TESTING_PREFIX + `/purchase/${createdPurchase.id}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.isRefund).toBe(true);
    });

    test("GET /purchase/:id - Non-Existent Purchase ID", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/111e99a6-d082-4327-9843-97fd228d4d37", {
            method: "GET",
        });

        expect(response.status).toBe(404);
    });

    test("GET /purchase/:id - Empty Purchase ID", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/", {
            method: "GET",
        });

        expect([404, 405]).toContain(response.status);
    });

    test("GET /purchase/:id - Invalid UUID Format", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/invalid-uuid-format", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchase/:id - Special Characters in ID", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/@#$%^&*()", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchase/:id - Numeric ID", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase/12345", {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });

    test("GET /purchase/:id - Very Long ID String", async () => {
        const longId = "a".repeat(500);
        const response = await app.request(TESTING_PREFIX + `"/purchase/${longId}`, {
            method: "GET",
        });

        expect([400, 404]).toContain(response.status);
    });
});
