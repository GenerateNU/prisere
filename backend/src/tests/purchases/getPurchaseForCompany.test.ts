import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { CreateOrChangePurchaseRequest, GetCompanyPurchasesResponse } from "../../modules/purchase/types";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

describe("GET /purchase", () => {
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

    const createPurchase = async (payload?: Partial<CreateOrChangePurchaseRequest>) => {
        await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify(payload),
        });
    };

    test("GET /purchase - Valid companyId", async () => {
        for (let i = 0; i < 5; i++) {
            await createPurchase([
                {
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase`, {
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        body.forEach((purchase: GetCompanyPurchasesResponse[number]) => {
            expect(purchase.id).toBeDefined();
            expect(purchase.companyId).toBeDefined();
            expect(purchase.quickBooksID).toBeDefined();
            expect(purchase.totalAmountCents).toBeDefined();
            expect(purchase.isRefund).toBeDefined();
            expect(purchase.dateCreated).toBeDefined();
        });
    });

    test("GET /purchase - With pageNumber", async () => {
        // Create some purchases
        for (let i = 0; i < 3; i++) {
            await createPurchase([
                {
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=1`, {
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test("GET /purchase - With resultsPerPage", async () => {
        // Create 15 purchases
        for (let i = 0; i < 15; i++) {
            await createPurchase([
                {
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=10`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(10);
    });

    test("GET /purchase - With pageNumber and resultsPerPage", async () => {
        // Create 10 purchases
        for (let i = 0; i < 10; i++) {
            await createPurchase([
                {
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=0&resultsPerPage=5`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(5);
    });

    test("GET /purchase - Default Pagination Values", async () => {
        // Create 25 purchases to test default page size
        for (let i = 0; i < 25; i++) {
            await createPurchase([
                {
                    isRefund: false,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                },
            ]);
        }

        // Should use default pageNumber=0 and resultsPerPage=20
        const response = await app.request(TESTING_PREFIX + `/purchase`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(20);
    });

    test("GET /purchase - Non-Existent companyId", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase", {
            method: "GET",
            headers: {
                companyId: "b32504f7-2e20-4bbc-869c-dea036d352e7",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    test("GET /purchase - Missing companyId", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase", {
            method: "GET",
            headers: {
                companyId: "",
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid companyId Type (String)", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase", {
            method: "GET",
            headers: {
                companyId: "companyId=not-a-number",
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid pageNumber Type", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=invalid`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid resultsPerPage Type", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=invalid`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Negative pageNumber", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=-1`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Negative resultsPerPage", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=-5`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Zero resultsPerPage", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=0`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Very Large pageNumber", async () => {
        // Create a few purchases
        for (let i = 0; i < 5; i++) {
            await createPurchase([
                {
                    isRefund: false,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=10000`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    test("GET /purchase - Very Large resultsPerPage", async () => {
        // Create a few purchases
        for (let i = 0; i < 5; i++) {
            await createPurchase([
                {
                    isRefund: false,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=1000`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test("GET /purchase - Multiple Purchases Same Company", async () => {
        const purchaseCount = 5;

        // Create multiple purchases for the same company
        for (let i = 0; i < purchaseCount; i++) {
            await createPurchase([
                {
                    quickBooksId: 20000 + i,
                    totalAmountCents: 100000 + i * 5000,
                    isRefund: i % 2 === 0,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=10`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(purchaseCount);

        // Verify all purchases belong to the same company
        body.forEach((purchase: GetCompanyPurchasesResponse[number]) => {
            expect(purchase.companyId).toBe("ffc8243b-876e-4b6d-8b80-ffc73522a838");
        });
    });
});
