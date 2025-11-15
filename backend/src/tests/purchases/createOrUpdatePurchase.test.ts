import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { PurchaseSeeder, seededPurchases } from "../../database/seeds/purchase.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { beforeEach } from "node:test";
import { DataSource } from "typeorm";

describe("POST /purchase", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        const purchaseSeeder = new PurchaseSeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);
        await purchaseSeeder.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /purchase Create Purchase All Required Fields", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(createdCompanyJSON);
        expect(body[0].quickBooksId).toBe(requestBodies.items[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies.items[0].totalAmountCents);
        expect(body[0].isRefund).toBe(false);
        expect(body[0].id).toBeDefined();
        expect(body[0].dateCreated).toBeDefined();
    });

    test("POST /purchase Create Purchase Without quickBooksId", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    totalAmountCents: 50000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(createdCompanyJSON);
        expect(body[0].quickBooksId).toBeNull();
        expect(body[0].totalAmountCents).toBe(requestBodies.items[0].totalAmountCents);
        expect(body[0].isRefund).toBe(false);
    });

    test("POST /purchase Create Purchase With isRefund True", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 67890,
                    totalAmountCents: 25000,
                    isRefund: true,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(createdCompanyJSON);
        expect(body[0].quickBooksId).toBe(requestBodies.items[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies.items[0].totalAmountCents);
        expect(body[0].isRefund).toBe(true);
    });

    test("POST /purchase Create Purchase With isRefund False", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";

        const requestBodies = {
            items: [
                {
                    quickBooksId: 11111,
                    totalAmountCents: 75000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].isRefund).toBe(false);
    });

    test("POST /purchase Update Purchase Update totalAmountCents", async () => {
        const purchase = seededPurchases[0];
        const requestBodies = {
            items: [
                {
                    quickBooksId: purchase.quickBooksId,
                    totalAmountCents: 100000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: purchase.companyId,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(purchase.id);
        expect(body[0].totalAmountCents).toBe(requestBodies.items[0].totalAmountCents);
    });

    test("POST /purchase Update Purchase Update isRefund", async () => {
        const purchase = seededPurchases[0];
        const requestBodies = {
            items: [
                {
                    quickBooksId: purchase.quickBooksId,
                    totalAmountCents: purchase.totalAmountCents,
                    isRefund: true,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: purchase.companyId,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(purchase.id);
        expect(body[0].isRefund).toBe(true);
    });

    test("POST /purchase Update Purchase Update All Fields", async () => {
        const purchase = seededPurchases[0];
        const requestBodies = {
            items: [
                {
                    quickBooksId: purchase.quickBooksId,
                    totalAmountCents: 150000,
                    isRefund: true,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: purchase.companyId,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(purchase.id);
        expect(body[0].quickBooksId).toBe(requestBodies.items[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies.items[0].totalAmountCents);
        expect(body[0].isRefund).toBe(requestBodies.items[0].isRefund);
    });

    test("POST /purchase Invalid companyId Type", async () => {
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "123",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Invalid quickBooksId Type", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: "not-a-number",
                    totalAmountCents: 50000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Invalid totalAmountCents Type", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: "fifty-thousand",
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Invalid isRefund Type", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                    isRefund: "true",
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Empty companyId", async () => {
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Empty purchaseId", async () => {
        const requestBodies = {
            items: [
                {
                    totalAmountCents: 100000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "company-id",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Missing isRefund Field", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Missing totalAmountCents Field", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Missing companyId Field", async () => {
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Create Multiple Purchases in Batch", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                    isRefund: false,
                },
                {
                    quickBooksId: 67890,
                    totalAmountCents: 75000,
                    isRefund: true,
                },
                {
                    quickBooksId: 11111,
                    totalAmountCents: 100000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveLength(3);
        expect(body[0].quickBooksId).toBe(12345);
        expect(body[1].quickBooksId).toBe(67890);
        expect(body[1].isRefund).toBe(true);
        expect(body[2].quickBooksId).toBe(11111);
    });

    test("POST /purchase Update Multiple Purchases in Batch", async () => {
        const requestBodies = {
            items: [
                {
                    quickBooksId: seededPurchases[0].quickBooksId,
                    totalAmountCents: 200000,
                    isRefund: false,
                },
                {
                    quickBooksId: seededPurchases[1].quickBooksId,
                    totalAmountCents: 10,
                    isRefund: true,
                },
                {
                    quickBooksId: seededPurchases[2].quickBooksId,
                    totalAmountCents: 300000,
                    isRefund: true,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: seededPurchases[0].companyId,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveLength(3);
        expect(body[0].id).toBe(seededPurchases[0].id);
        expect(body[0].totalAmountCents).toBe(200000);
        expect(body[1].quickBooksId).toBe(seededPurchases[1].quickBooksId);
        expect(body[1].totalAmountCents).toBe(requestBodies.items[1].totalAmountCents);
        expect(body[1].isRefund).toBe(true);
        expect(body[2].id).toBe(seededPurchases[2].id);
        expect(body[2].totalAmountCents).toBe(300000);
        expect(body[2].isRefund).toBe(true);
    });

    test("POST /purchase Mixed Create and Update in Batch", async () => {
        const requestBodies = {
            items: [
                {
                    quickBooksId: 11111,
                    totalAmountCents: 50000,
                    isRefund: false,
                },
                {
                    quickBooksId: seededPurchases[0].quickBooksId,
                    totalAmountCents: 150000,
                    isRefund: false,
                },
                {
                    quickBooksId: 22222,
                    totalAmountCents: 75000,
                    isRefund: true,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: seededPurchases[0].companyId,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveLength(3);
        expect(body[0].quickBooksId).toBe(11111);
        expect(body[0].id).not.toBe(seededPurchases[0].id);
        expect(body[1].id).toBe(seededPurchases[0].id);
        expect(body[1].totalAmountCents).toBe(150000);
        expect(body[2].isRefund).toBe(true);
        expect(body[2].quickBooksId).toBe(22222);
    });

    test("POST /purchase Batch with One Invalid Entry Returns 400", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: [
                {
                    quickBooksId: 12345,
                    totalAmountCents: 50000,
                    isRefund: false,
                },
                {
                    quickBooksId: "invalid-id",
                    totalAmountCents: 75000,
                    isRefund: false,
                },
                {
                    quickBooksId: 11111,
                    totalAmountCents: 100000,
                    isRefund: false,
                },
            ],
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Empty Batch Array", async () => {
        const requestBodies = { items: [] };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "0199e5bb-9e51-78b7-ad43-9c8b4fddec57",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Large Batch of Purchases", async () => {
        const createdCompanyJSON = "ffc8243b-876e-4b6d-8b80-ffc73522a838";
        const requestBodies = {
            items: Array.from({ length: 50 }, (_, i) => ({
                quickBooksId: 10000 + i,
                totalAmountCents: 50000 + i * 1000,
                isRefund: i % 2 === 0,
            })),
        };

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: createdCompanyJSON,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveLength(50);
        expect(body[0].quickBooksId).toBe(10000);
        expect(body[49].quickBooksId).toBe(10049);
    });
});
