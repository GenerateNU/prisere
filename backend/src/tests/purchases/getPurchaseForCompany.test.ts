import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import {
    CreateOrChangePurchaseRequest,
    GetCompanyPurchasesResponse,
    PurchasesWithCount,
} from "../../modules/purchase/types";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder, { seededCompanies } from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { PurchaseSeeder, seededPurchases } from "../../database/seeds/purchase.seed";
import { PurchaseLineItemSeeder } from "../../database/seeds/purchaseLineItem.seed";
import { Purchase } from "../../entities/Purchase";

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
            await createPurchase({
                items: [
                    {
                        quickBooksId: 10000 + i,
                        totalAmountCents: 50000 + i * 1000,
                        isRefund: false,
                    },
                ],
            });
        }

        const response = await app.request(TESTING_PREFIX + `/purchase`, {
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body: PurchasesWithCount = await response.json();
        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBeGreaterThan(0);
        body.purchases.forEach((purchase) => {
            expect(purchase.id).toBeDefined();
            expect(purchase.companyId).toBeDefined();
            expect(purchase.quickBooksId).toBeDefined();
            expect(purchase.totalAmountCents).toBeDefined();
            expect(purchase.isRefund).toBeDefined();
            expect(purchase.dateCreated).toBeDefined();
            expect(purchase.lineItems).toBeDefined();
        });
    });

    test("GET /purchase - With pageNumber", async () => {
        // Create some purchases
        for (let i = 0; i < 3; i++) {
            await createPurchase({
                items: [
                    {
                        quickBooksId: 10000 + i,
                        totalAmountCents: 50000 + i * 1000,
                        isRefund: false,
                    },
                ],
            });
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=1`, {
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            method: "GET",
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.purchases)).toBe(true);
    });

    test("GET /purchase - With resultsPerPage", async () => {
        // Create 15 purchases
        for (let i = 0; i < 15; i++) {
            await createPurchase({
                items: [
                    {
                        quickBooksId: 10000 + i,
                        totalAmountCents: 50000 + i * 1000,
                        isRefund: false,
                    },
                ],
            });
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=10`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBeLessThanOrEqual(10);
    });

    test("GET /purchase - With pageNumber and resultsPerPage", async () => {
        // Create 10 purchases
        for (let i = 0; i < 10; i++) {
            await createPurchase({
                items: [
                    {
                        quickBooksId: 10000 + i,
                        totalAmountCents: 50000 + i * 1000,
                        isRefund: false,
                    },
                ],
            });
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=0&resultsPerPage=5`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBeLessThanOrEqual(5);
    });

    test("GET /purchase - Default Pagination Values", async () => {
        // Create 25 purchases to test default page size
        for (let i = 0; i < 25; i++) {
            await createPurchase({
                items: [
                    {
                        isRefund: false,
                        quickBooksId: 10000 + i,
                        totalAmountCents: 50000 + i * 1000,
                    },
                ],
            });
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
        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBeLessThanOrEqual(20);
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
        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBe(0);
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
            await createPurchase({
                items: [
                    {
                        isRefund: false,
                        quickBooksId: 10000 + i,
                        totalAmountCents: 50000,
                    },
                ],
            });
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?pageNumber=10000`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBe(0);
    });

    test("GET /purchase - Very Large resultsPerPage", async () => {
        // Create a few purchases
        for (let i = 0; i < 5; i++) {
            await createPurchase({
                items: [
                    {
                        isRefund: false,
                        quickBooksId: 10000 + i,
                        totalAmountCents: 50000,
                    },
                ],
            });
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=1000`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.purchases)).toBe(true);
    });

    test("GET /purchase - Multiple Purchases Same Company", async () => {
        const purchaseCount = 5;

        // Create multiple purchases for the same company
        for (let i = 0; i < purchaseCount; i++) {
            await createPurchase({
                items: [
                    {
                        quickBooksId: 20000 + i,
                        totalAmountCents: 100000 + i * 5000,
                        isRefund: i % 2 === 0,
                    },
                ],
            });
        }

        const response = await app.request(TESTING_PREFIX + `/purchase?resultsPerPage=10`, {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBe(purchaseCount);

        // Verify all purchases belong to the same company
        body.purchases.forEach((purchase: Purchase) => {
            expect(purchase.companyId).toBe("ffc8243b-876e-4b6d-8b80-ffc73522a838");
        });
    });
});

/**
 * NEW TESTS ADDED FOR THE UPDATES TO THE ENDPOINT.
 */

describe("GET /purchase - Filtered and Sorted", () => {
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

        const purchaseSeeder = new PurchaseSeeder();
        await purchaseSeeder.run(dataSource, {} as SeederFactoryManager);

        const purchaseLineItemSeeder = new PurchaseLineItemSeeder();
        await purchaseLineItemSeeder.run(dataSource, {} as SeederFactoryManager);
    });

    test("GET /purchase - No filters returns all purchases", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.purchases.length).toBe(6);

        const purchaseIds = body.purchases.map((p: Purchase) => p.id);
        expect(purchaseIds).toContain(seededPurchases[0].id);
        expect(purchaseIds).toContain(seededPurchases[1].id);
        expect(purchaseIds).toContain(seededPurchases[2].id);
        expect(purchaseIds).toContain(seededPurchases[3].id);
        expect(purchaseIds).toContain(seededPurchases[4].id);
        expect(purchaseIds).toContain(seededPurchases[5].id);
    });

    test("GET /purchase - Filter by Supplies category", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?categories=Supplies`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(2);
        expect(body.purchases[0].id).toBe(seededPurchases[0].id);
        expect(body.purchases[1].id).toBe(seededPurchases[4].id);

        expect(body.purchases[0].lineItems.some((li) => li.category === "Supplies")).toBe(true);
        expect(body.purchases[1].lineItems.some((li) => li.category === "Supplies")).toBe(true);
    });

    test("GET /purchase - Filter by Technology category ", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?categories=Technology`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(2);
        expect(body.purchases[0].id).toBe(seededPurchases[0].id);
        expect(body.purchases[1].id).toBe(seededPurchases[5].id);

        expect(body.purchases[0].lineItems.some((li) => li.category === "Technology")).toBe(true);
        expect(body.purchases[1].lineItems.some((li) => li.category === "Technology")).toBe(true);
    });

    test("GET /purchase - Filter by multiple categories ", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?categories=Supplies&categories=Technology`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(3);

        const returnedIds = body.purchases.map((p) => p.id).sort();
        expect(returnedIds).toEqual(
            [
                seededPurchases[0].id,
                "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
                "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
            ].sort()
        );

        body.purchases.forEach((purchase) => {
            const hasMatchingCategory = purchase.lineItems.some(
                (li) => li.category === "Supplies" || li.category === "Technology"
            );
            expect(hasMatchingCategory).toBe(true);
        });

        const purchase0 = body.purchases.find((p) => p.id === seededPurchases[0].id);
        expect(purchase0?.lineItems.some((li) => li.category === "Supplies")).toBe(true);
        expect(purchase0?.lineItems.some((li) => li.category === "Technology")).toBe(true);

        const suppliesOnly = body.purchases.find((p) => p.id === "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
        expect(suppliesOnly?.lineItems.some((li) => li.category === "Supplies")).toBe(true);
        expect(suppliesOnly?.lineItems.every((li) => li.category !== "Technology")).toBe(true);

        const technologyOnly = body.purchases.find((p) => p.id === "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e");
        expect(technologyOnly?.lineItems.some((li) => li.category === "Technology")).toBe(true);
        expect(technologyOnly?.lineItems.every((li) => li.category !== "Supplies")).toBe(true);
    });

    test("GET /purchase - Filter by non-existent category", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?categories=NonExistent`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;
        expect(body.purchases.length).toBe(0);
    });

    test("GET /purchase - Filter by type typical", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?type=typical`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(3);
        const returnedIds = body.purchases.map((p) => p.id).sort();
        expect(returnedIds).toEqual([seededPurchases[0].id, seededPurchases[4].id, seededPurchases[5].id].sort());
    });

    test("GET /purchase - Filter by type extraneous", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?type=extraneous`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(1);
        expect(body.purchases[0].id).toBe(seededPurchases[0].id);
        expect(body.purchases[0].lineItems.some((li) => li.type === "extraneous")).toBe(true);
    });

    test("GET /purchase - Invalid type returns 400", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?type=invalid`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - dateFrom undefined should not filter", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/purchase?dateTo=${encodeURIComponent(new Date("2025-12-31T23:59:59Z").toISOString())}`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;
        // Should return all seeded purchases since dateFrom is missing
        expect(body.purchases.length).toBe(6);
        const returnedIds = body.purchases.map((p) => p.id).sort();
        expect(returnedIds).toEqual(
            [
                seededPurchases[0].id,
                seededPurchases[1].id,
                seededPurchases[2].id,
                seededPurchases[3].id,
                seededPurchases[4].id,
                seededPurchases[5].id,
            ].sort()
        );
    });

    test("GET /purchase - dateTo undefined should not filter", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/purchase?dateFrom=${encodeURIComponent(new Date("2024-01-01T00:00:00Z").toISOString())}`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;
        // Should return all seeded purchases since dateTo is missing
        expect(body.purchases.length).toBe(6);
        const returnedIds = body.purchases.map((p) => p.id).sort();
        expect(returnedIds).toEqual(
            [
                seededPurchases[0].id,
                seededPurchases[1].id,
                seededPurchases[2].id,
                seededPurchases[3].id,
                seededPurchases[4].id,
                seededPurchases[5].id,
            ].sort()
        );
    });

    test("GET /purchase - dateFrom equals dateTo should return 400", async () => {
        const sameDate = new Date("2025-01-01T00:00:00Z").toISOString();
        const response = await app.request(
            TESTING_PREFIX +
                `/purchase?dateFrom=${encodeURIComponent(sameDate)}&dateTo=${encodeURIComponent(sameDate)}`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(400);
    });

    test("GET /purchase - dateFrom later than dateTo should return 400", async () => {
        const dateFrom = new Date("2025-03-01T00:00:00Z").toISOString();
        const dateTo = new Date("2025-01-01T00:00:00Z").toISOString();
        const response = await app.request(
            TESTING_PREFIX + `/purchase?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Filter by date range (Jan 2025)", async () => {
        const dateFrom = new Date("2025-01-01T00:00:00Z").toISOString();
        const dateTo = new Date("2025-01-31T23:59:59Z").toISOString();

        const response = await app.request(
            TESTING_PREFIX + `/purchase?dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(2);
        expect(body.purchases.map((p) => p.id).sort()).toEqual([seededPurchases[1].id, seededPurchases[2].id].sort());
    });

    test("GET /purchase - dateFrom undefined should not filter", async () => {
        const dateTo = new Date("2025-12-31T23:59:59Z").toISOString();

        const response = await app.request(TESTING_PREFIX + `/purchase?dateTo=${encodeURIComponent(dateTo)}`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(6);
        const returnedIds = body.purchases.map((p) => p.id).sort();
        expect(returnedIds).toEqual(
            [
                seededPurchases[0].id,
                seededPurchases[1].id,
                seededPurchases[2].id,
                seededPurchases[3].id,
                seededPurchases[4].id,
                seededPurchases[5].id,
            ].sort()
        );
    });

    test("GET /purchase - dateTo undefined should not filter", async () => {
        const dateFrom = new Date("2024-01-01T00:00:00Z").toISOString();

        const response = await app.request(TESTING_PREFIX + `/purchase?dateFrom=${encodeURIComponent(dateFrom)}`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(6);
        const returnedIds = body.purchases.map((p) => p.id).sort();
        expect(returnedIds).toEqual(
            [
                seededPurchases[0].id,
                seededPurchases[1].id,
                seededPurchases[2].id,
                seededPurchases[3].id,
                seededPurchases[4].id,
                seededPurchases[5].id,
            ].sort()
        );
    });

    test("GET /purchase - Invalid dateFrom format returns 400", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?dateFrom=invalid-date`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });
        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid dateTo format returns 400", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?dateTo=not-a-date`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });
        expect(response.status).toBe(400);
    });

    test("GET /purchase - Search by 'Office' in description", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?search=Office`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(1);
        expect(body.purchases[0].id).toBe(seededPurchases[0].id);
        expect(body.purchases[0].lineItems.some((li) => li.description?.includes("Office"))).toBe(true);
    });

    test("GET /purchase - Search by 'Software' in description", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?search=Software`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(1);
        expect(body.purchases[0].id).toBe(seededPurchases[0].id);
        expect(body.purchases[0].lineItems.some((li) => li.description?.includes("Software"))).toBe(true);
    });

    test("GET /purchase - Search with no results", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?search=NonExistentSearch`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;
        expect(body.purchases.length).toBe(0);
    });

    test("GET /purchase - Sort by date DESC", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?sortBy=date&sortOrder=DESC`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(6);
        expect(body.purchases[0].id).toBe("b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e"); // 2025-03-02
        expect(body.purchases[1].id).toBe("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"); // 2025-03-01
        expect(body.purchases[2].id).toBe(seededPurchases[0].id); // 2025-02-05
        expect(body.purchases[3].id).toBe(seededPurchases[1].id); // 2025-01-11
        expect(body.purchases[4].id).toBe(seededPurchases[2].id); // 2025-01-09
        expect(body.purchases[5].id).toBe(seededPurchases[3].id); // 2024-04-11

        for (let i = 1; i < body.purchases.length; i++) {
            expect(new Date(body.purchases[i - 1].dateCreated) >= new Date(body.purchases[i].dateCreated)).toBe(true);
        }
    });

    test("GET /purchase - Sort by date ASC", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?sortBy=date&sortOrder=ASC`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(6);
        expect(body.purchases[0].id).toBe(seededPurchases[3].id); // 2024-04-11
        expect(body.purchases[1].id).toBe(seededPurchases[2].id); // 2025-01-09
        expect(body.purchases[2].id).toBe(seededPurchases[1].id); // 2025-01-11
        expect(body.purchases[3].id).toBe(seededPurchases[0].id); // 2025-02-05
        expect(body.purchases[4].id).toBe("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"); // 2025-03-01
        expect(body.purchases[5].id).toBe("b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e"); // 2025-03-02

        for (let i = 1; i < body.purchases.length; i++) {
            expect(new Date(body.purchases[i - 1].dateCreated) <= new Date(body.purchases[i].dateCreated)).toBe(true);
        }
    });

    test("GET /purchase - Sort by totalAmountCents ASC", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?sortBy=totalAmountCents&sortOrder=ASC`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(6);
        expect(body.purchases[0].id).toBe(seededPurchases[3].id);
        expect(body.purchases[0].totalAmountCents).toBe(50);
        expect(body.purchases[1].id).toBe(seededPurchases[2].id);
        expect(body.purchases[1].totalAmountCents).toBe(456);
        expect(body.purchases[2].id).toBe(seededPurchases[0].id);
        expect(body.purchases[2].totalAmountCents).toBe(1234);
        expect(body.purchases[3].id).toBe("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
        expect(body.purchases[3].totalAmountCents).toBe(2000);
        expect(body.purchases[4].id).toBe("b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e");
        expect(body.purchases[4].totalAmountCents).toBe(3000);
        expect(body.purchases[5].id).toBe(seededPurchases[1].id);
        expect(body.purchases[5].totalAmountCents).toBe(5678);

        for (let i = 1; i < body.purchases.length; i++) {
            expect(body.purchases[i - 1].totalAmountCents <= body.purchases[i].totalAmountCents).toBe(true);
        }
    });

    test("GET /purchase - Sort by totalAmountCents DESC", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?sortBy=totalAmountCents&sortOrder=DESC`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(6);
        expect(body.purchases[0].id).toBe(seededPurchases[1].id);
        expect(body.purchases[0].totalAmountCents).toBe(5678);
        expect(body.purchases[1].id).toBe("b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e");
        expect(body.purchases[1].totalAmountCents).toBe(3000);
        expect(body.purchases[2].id).toBe("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
        expect(body.purchases[2].totalAmountCents).toBe(2000);
        expect(body.purchases[3].id).toBe(seededPurchases[0].id);
        expect(body.purchases[3].totalAmountCents).toBe(1234);
        expect(body.purchases[4].id).toBe(seededPurchases[2].id);
        expect(body.purchases[4].totalAmountCents).toBe(456);
        expect(body.purchases[5].id).toBe(seededPurchases[3].id);
        expect(body.purchases[5].totalAmountCents).toBe(50);

        for (let i = 1; i < body.purchases.length; i++) {
            expect(body.purchases[i - 1].totalAmountCents >= body.purchases[i].totalAmountCents).toBe(true);
        }
    });

    test("GET /purchase - Invalid sortBy returns 400", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?sortBy=invalid`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Invalid sortOrder returns 400", async () => {
        const response = await app.request(TESTING_PREFIX + `/purchase?sortBy=date&sortOrder=INVALID`, {
            method: "GET",
            headers: {
                companyId: seededCompanies[0].id,
            },
        });

        expect(response.status).toBe(400);
    });

    test("GET /purchase - Pagination pageNumber=0, resultsPerPage=2", async () => {
        const response = await app.request(
            TESTING_PREFIX + `/purchase?pageNumber=0&resultsPerPage=2&sortBy=date&sortOrder=DESC`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(2);
        expect(body.purchases[0].id).toBe("b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e");
        expect(body.purchases[1].id).toBe("a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d");
    });

    test("GET /purchase - Pagination all pages, resultsPerPage = 2", async () => {
        // PAGE 0
        const responsePage0 = await app.request(
            TESTING_PREFIX + `/purchase?pageNumber=0&resultsPerPage=2&sortBy=date&sortOrder=DESC`,
            {
                method: "GET",
                headers: { companyId: seededCompanies[0].id },
            }
        );

        expect(responsePage0.status).toBe(200);
        const bodyPage0 = (await responsePage0.json()) as GetCompanyPurchasesResponse;

        expect(Array.isArray(bodyPage0.purchases)).toBe(true);
        expect(bodyPage0.purchases.length).toBe(2);
        expect(bodyPage0.purchases[0].id).toBe(seededPurchases[5].id);
        expect(bodyPage0.purchases[1].id).toBe(seededPurchases[4].id);

        // PAGE 1
        const responsePage1 = await app.request(
            TESTING_PREFIX + `/purchase?pageNumber=1&resultsPerPage=2&sortBy=date&sortOrder=DESC`,
            {
                method: "GET",
                headers: { companyId: seededCompanies[0].id },
            }
        );

        expect(responsePage1.status).toBe(200);
        const bodyPage1 = (await responsePage1.json()) as GetCompanyPurchasesResponse;

        expect(Array.isArray(bodyPage1.purchases)).toBe(true);
        expect(bodyPage1.purchases.length).toBe(2);
        expect(bodyPage1.purchases[0].id).toBe(seededPurchases[0].id);
        expect(bodyPage1.purchases[1].id).toBe(seededPurchases[1].id);

        const page0Ids = bodyPage0.purchases.map((p) => p.id);
        const page1Ids = bodyPage1.purchases.map((p) => p.id);
        page1Ids.forEach((id) => expect(page0Ids).not.toContain(id));

        // PAGE 2
        const responsePage2 = await app.request(
            TESTING_PREFIX + `/purchase?pageNumber=2&resultsPerPage=2&sortBy=date&sortOrder=DESC`,
            {
                method: "GET",
                headers: { companyId: seededCompanies[0].id },
            }
        );

        expect(responsePage2.status).toBe(200);
        const bodyPage2 = (await responsePage2.json()) as GetCompanyPurchasesResponse;

        expect(Array.isArray(bodyPage2.purchases)).toBe(true);
        expect(bodyPage2.purchases.length).toBe(2);
        expect(bodyPage2.purchases[0].id).toBe(seededPurchases[2].id);
        expect(bodyPage2.purchases[1].id).toBe(seededPurchases[3].id);

        // PAGE 3 (should be empty)
        const responsePage3 = await app.request(
            TESTING_PREFIX + `/purchase?pageNumber=3&resultsPerPage=2&sortBy=date&sortOrder=DESC`,
            {
                method: "GET",
                headers: { companyId: seededCompanies[0].id },
            }
        );

        expect(responsePage3.status).toBe(200);
        const bodyPage3 = (await responsePage3.json()) as GetCompanyPurchasesResponse;

        expect(Array.isArray(bodyPage3.purchases)).toBe(true);
        expect(bodyPage3.purchases.length).toBe(0);
    });

    test("GET /purchase - Combined: category + type + dateRange + sort", async () => {
        const dateFrom = new Date("2024-01-01T00:00:00Z").toISOString();
        const dateTo = new Date("2025-12-31T23:59:59Z").toISOString();

        const response = await app.request(
            TESTING_PREFIX +
                `/purchase?categories=Supplies&type=typical&dateFrom=${encodeURIComponent(
                    dateFrom
                )}&dateTo=${encodeURIComponent(dateTo)}&sortBy=date&sortOrder=DESC`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(body.purchases.length).toBe(2);
        const returnedIds = body.purchases.map((p) => p.id).sort();
        expect(returnedIds).toEqual(["89cac778-b8d8-48c2-a2da-77019c57944e", "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"]);
    });

    test("GET /purchase - Combined filters use AND logic (not OR)", async () => {
        const dateFrom = new Date("2024-01-01T00:00:00Z").toISOString();
        const dateTo = new Date("2025-12-31T23:59:59Z").toISOString();

        const response = await app.request(
            TESTING_PREFIX +
                `/purchase?categories=Technology&type=typical&search=Office&dateFrom=${encodeURIComponent(
                    dateFrom
                )}&dateTo=${encodeURIComponent(dateTo)}&sortBy=date&sortOrder=DESC`,
            {
                method: "GET",
                headers: {
                    companyId: seededCompanies[0].id,
                },
            }
        );

        expect(response.status).toBe(200);
        const body = (await response.json()) as GetCompanyPurchasesResponse;

        expect(Array.isArray(body.purchases)).toBe(true);
        expect(body.purchases.length).toBe(1);
    });
});
