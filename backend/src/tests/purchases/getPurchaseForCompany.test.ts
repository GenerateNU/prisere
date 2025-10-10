import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { CreateOrChangePurchaseDTO, GetCompanyPurchasesResponse } from "../../modules/purchase/types";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("GET /purchase", () => {
    let app: Hono;
    let backup: IBackup;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    afterEach(async () => {
        backup.restore();
    });

    const createCompany = async () => {
        const companyRequest = {
            name: "Cool Company",
        };

        const createCompanyResponse = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(companyRequest),
        });

        return await createCompanyResponse.json();
    };

    const createPurchase = async (payload?: Partial<CreateOrChangePurchaseDTO>) => {
        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return await response.json();
    };

    test("GET /purchase - Valid companyId", async () => {
        const company = await createCompany();
        const companyId = company.id;

        for (let i = 0; i < 5; i++) {
            await createPurchase([
                {
                    companyId: companyId,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${companyId}`, {
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
        const company = await createCompany();
        const companyId = company.id;

        // Create some purchases
        for (let i = 0; i < 3; i++) {
            await createPurchase([
                {
                    companyId: companyId,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${companyId}&pageNumber=1`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test("GET /purchase - With resultsPerPage", async () => {
        const company = await createCompany();
        const companyId = company.id;

        // Create 15 purchases
        for (let i = 0; i < 15; i++) {
            await createPurchase([
                {
                    companyId: companyId,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${companyId}&resultsPerPage=10`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(10);
    });

    test("GET /purchase - With pageNumber and resultsPerPage", async () => {
        const company = await createCompany();
        const companyId = company.id;

        // Create 10 purchases
        for (let i = 0; i < 10; i++) {
            await createPurchase([
                {
                    companyId: companyId,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                    isRefund: false,
                },
            ]);
        }

        const response = await app.request(
            TESTING_PREFIX + `/purchase?companyId=${companyId}&pageNumber=0&resultsPerPage=5`,
            {
                method: "GET",
            }
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(5);
    });

    test("GET /purchase - Default Pagination Values", async () => {
        const company = await createCompany();
        const companyId = company.id;

        // Create 25 purchases to test default page size
        for (let i = 0; i < 25; i++) {
            await createPurchase([
                {
                    isRefund: false,
                    companyId: companyId,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000 + i * 1000,
                },
            ]);
        }

        // Should use default pageNumber=0 and resultsPerPage=20
        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${companyId}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeLessThanOrEqual(20);
    });

    test("GET /purchase - Non-Existent companyId", async () => {
        const response = await app.request(
            TESTING_PREFIX + "/purchase?companyId=b32504f7-2e20-4bbc-869c-dea036d352e7",
            {
                method: "GET",
            }
        );

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    test("GET /purchase - Missing companyId", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid companyId Type (String)", async () => {
        const response = await app.request(TESTING_PREFIX + "/purchase?companyId=not-a-number", {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid pageNumber Type", async () => {
        const company = await createCompany();
        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${company.id}&pageNumber=invalid`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid resultsPerPage Type", async () => {
        const company = await createCompany();
        const response = await app.request(
            TESTING_PREFIX + `/purchase?companyId=${company.id}&resultsPerPage=invalid`,
            {
                method: "GET",
            }
        );

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Negative pageNumber", async () => {
        const company = await createCompany();
        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${company.id}&pageNumber=-1`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Negative resultsPerPage", async () => {
        const company = await createCompany();
        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${company.id}&resultsPerPage=-5`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Zero resultsPerPage", async () => {
        const company = await createCompany();
        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${company.id}&resultsPerPage=0`, {
            method: "GET",
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Very Large pageNumber", async () => {
        const company = await createCompany();
        const companyId = company.id;

        // Create a few purchases
        for (let i = 0; i < 5; i++) {
            await createPurchase([
                {
                    isRefund: false,
                    companyId: companyId,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${companyId}&pageNumber=10000`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
    });

    test("GET /purchase - Very Large resultsPerPage", async () => {
        const company = await createCompany();
        const companyId = company.id;

        // Create a few purchases
        for (let i = 0; i < 5; i++) {
            await createPurchase([
                {
                    isRefund: false,
                    companyId: companyId,
                    quickBooksId: 10000 + i,
                    totalAmountCents: 50000,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${companyId}&resultsPerPage=1000`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test("GET /purchase - Multiple Purchases Same Company", async () => {
        const company = await createCompany();
        const companyId = company.id;
        const purchaseCount = 5;

        // Create multiple purchases for the same company
        for (let i = 0; i < purchaseCount; i++) {
            await createPurchase([
                {
                    companyId: companyId,
                    quickBooksId: 20000 + i,
                    totalAmountCents: 100000 + i * 5000,
                    isRefund: i % 2 === 0,
                },
            ]);
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?companyId=${companyId}&resultsPerPage=10`, {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(purchaseCount);

        // Verify all purchases belong to the same company
        body.forEach((purchase: GetCompanyPurchasesResponse[number]) => {
            expect(purchase.companyId).toBe(companyId);
        });
    });
});
