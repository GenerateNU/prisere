import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("POST /purchases", () => {
    let app: Hono;
    let backup: IBackup;

    const createCompany = async () => {
        const companyRequests = [
            {
                name: "Cool Company",
            },
        ];

        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(companyRequests[0]),
        });

        return await createCompanyResponse.json();
    };

    const createPurchase = async () => {
        const createdCompany = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompany.id,
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        return await response.json();
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /purchases Create Purchase All Required Fields", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(requestBodies[0].companyId);
        expect(body[0].quickBooksId).toBe(requestBodies[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
        expect(body[0].isRefund).toBe(false);
        expect(body[0].id).toBeDefined();
        expect(body[0].dateCreated).toBeDefined();
    });

    test("POST /purchases Create Purchase Without quickBooksId", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(requestBodies[0].companyId);
        expect(body[0].quickBooksId).toBeNull();
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
        expect(body[0].isRefund).toBe(false);
    });

    test("POST /purchases Create Purchase With isRefund True", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 67890,
                totalAmountCents: 25000,
                isRefund: true,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(requestBodies[0].companyId);
        expect(body[0].quickBooksId).toBe(requestBodies[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
        expect(body[0].isRefund).toBe(true);
    });

    test("POST /purchases Create Purchase With isRefund False", async () => {
        const createdCompanyJSON = await createCompany();

        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 11111,
                totalAmountCents: 75000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].isRefund).toBe(false);
    });

    test("POST /purchases Update Purchase Update totalAmountCents", async () => {
        const purchase = await createPurchase();
        const requestBodies = [
            {
                purchaseId: purchase[0].id,
                companyId: purchase[0].companyId,
                totalAmountCents: 100000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(requestBodies[0].purchaseId);
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
    });

    test("POST /purchases Update Purchase Update isRefund", async () => {
        const purchase = await createPurchase();
        const requestBodies = [
            {
                purchaseId: purchase[0].id,
                companyId: purchase[0].companyId,
                totalAmountCents: purchase[0].totalAmountCents,
                isRefund: true,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(purchase[0].id);
        expect(body[0].isRefund).toBe(true);
    });

    test("POST /purchases Update Purchase Update All Fields", async () => {
        const purchase = await createPurchase();
        const requestBodies = [
            {
                purchaseId: purchase[0].id,
                companyId: purchase[0].companyId,
                quickBooksId: 99999,
                totalAmountCents: 150000,
                isRefund: true,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(purchase[0].id);
        expect(body[0].quickBooksId).toBe(requestBodies[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
        expect(body[0].isRefund).toBe(requestBodies[0].isRefund);
    });

    test("POST /purchases Invalid companyId Type", async () => {
        const requestBodies = [
            {
                companyId: 123,
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Invalid quickBooksId Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: "not-a-number",
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Invalid totalAmountCents Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 12345,
                totalAmountCents: "fifty-thousand",
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Invalid isRefund Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: "true",
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Empty companyId", async () => {
        const requestBodies = [
            {
                companyId: "",
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Invalid purchaseId Type", async () => {
        const requestBodies = [
            {
                purchaseId: 123,
                companyId: "company-id",
                totalAmountCents: 100000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Empty purchaseId", async () => {
        const requestBodies = [
            {
                purchaseId: "",
                companyId: "company-id",
                totalAmountCents: 100000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Missing isRefund Field", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 12345,
                totalAmountCents: 50000,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Missing totalAmountCents Field", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 12345,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Missing companyId Field", async () => {
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Create Multiple Purchases in Batch", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 67890,
                totalAmountCents: 75000,
                isRefund: true,
            },
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 11111,
                totalAmountCents: 100000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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

    test("POST /purchases Update Multiple Purchases in Batch", async () => {
        const purchase1 = await createPurchase();
        const purchase2 = await createPurchase();
        const purchase3 = await createPurchase();

        const requestBodies = [
            {
                purchaseId: purchase1[0].id,
                companyId: purchase1[0].companyId,
                totalAmountCents: 200000,
                isRefund: false,
            },
            {
                purchaseId: purchase2[0].id,
                companyId: purchase2[0].companyId,
                totalAmountCents: purchase2[0].totalAmountCents,
                isRefund: true,
            },
            {
                purchaseId: purchase3[0].id,
                companyId: purchase3[0].companyId,
                totalAmountCents: 300000,
                isRefund: true,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveLength(3);
        expect(body[0].id).toBe(purchase1[0].id);
        expect(body[0].totalAmountCents).toBe(200000);
        expect(body[1].id).toBe(purchase2[0].id);
        expect(body[1].isRefund).toBe(true);
        expect(body[2].id).toBe(purchase3[0].id);
        expect(body[2].totalAmountCents).toBe(300000);
        expect(body[2].isRefund).toBe(true);
    });

    test("POST /purchases Mixed Create and Update in Batch", async () => {
        const createdCompanyJSON = await createCompany();
        const existingPurchase = await createPurchase();

        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 11111,
                totalAmountCents: 50000,
                isRefund: false,
            },
            {
                purchaseId: existingPurchase[0].id,
                companyId: existingPurchase[0].companyId,
                totalAmountCents: 150000,
                isRefund: false,
            },
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 22222,
                totalAmountCents: 75000,
                isRefund: true,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveLength(3);
        expect(body[0].quickBooksId).toBe(11111);
        expect(body[0].id).not.toBe(existingPurchase[0].id);
        expect(body[1].id).toBe(existingPurchase[0].id);
        expect(body[1].totalAmountCents).toBe(150000);
        expect(body[2].isRefund).toBe(true);
    });

    test("POST /purchases Batch with One Invalid Entry Returns 400", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: "invalid-id",
                totalAmountCents: 75000,
                isRefund: false,
            },
            {
                companyId: createdCompanyJSON?.id,
                quickBooksId: 11111,
                totalAmountCents: 100000,
                isRefund: false,
            },
        ];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Empty Batch Array", async () => {
        const requestBodies: any[] = [];

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases Large Batch of Purchases", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = Array.from({ length: 50 }, (_, i) => ({
            companyId: createdCompanyJSON?.id,
            quickBooksId: 10000 + i,
            totalAmountCents: 50000 + i * 1000,
            isRefund: i % 2 === 0,
        }));

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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
