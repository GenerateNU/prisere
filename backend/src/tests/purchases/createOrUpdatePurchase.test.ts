import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("POST /purchase", () => {
    let app: Hono;
    let backup: IBackup;

    const createCompany = async () => {
        const companyRequests = [
            {
                name: "Cool Company",
            },
        ];

        const createCompanyResponse = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "userId": "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify(companyRequests[0]),
        });

        return await createCompanyResponse.json();
    };

    const createPurchase = async () => {
        const createdCompany = await createCompany();
        const requestBodies = [
            {
                quickBooksId: Math.ceil(Math.random() * 1000),
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompany.id

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

    test("POST /purchase Create Purchase All Required Fields", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(createdCompanyJSON?.id);
        expect(body[0].quickBooksId).toBe(requestBodies[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
        expect(body[0].isRefund).toBe(false);
        expect(body[0].id).toBeDefined();
        expect(body[0].dateCreated).toBeDefined();
    });

    test("POST /purchase Create Purchase Without quickBooksId", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(createdCompanyJSON?.id);
        expect(body[0].quickBooksId).toBeNull();
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
        expect(body[0].isRefund).toBe(false);
    });

    test("POST /purchase Create Purchase With isRefund True", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                quickBooksId: 67890,
                totalAmountCents: 25000,
                isRefund: true,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].companyId).toBe(createdCompanyJSON?.id);
        expect(body[0].quickBooksId).toBe(requestBodies[0].quickBooksId);
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
        expect(body[0].isRefund).toBe(true);
    });

    test("POST /purchase Create Purchase With isRefund False", async () => {
        const createdCompanyJSON = await createCompany();

        const requestBodies = [
            {
                quickBooksId: 11111,
                totalAmountCents: 75000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].isRefund).toBe(false);
    });

    test("POST /purchase Update Purchase Update totalAmountCents", async () => {
        const purchase = await createPurchase();
        const requestBodies = [
            {
                quickBooksId: purchase[0].quickBooksId,
                totalAmountCents: 100000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": purchase[0].companyId
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(purchase[0].id);
        expect(body[0].totalAmountCents).toBe(requestBodies[0].totalAmountCents);
    });

    test("POST /purchase Update Purchase Update isRefund", async () => {
        const purchase = await createPurchase();
        const requestBodies = [
            {
                quickBooksId: purchase[0].quickBooksId,
                totalAmountCents: purchase[0].totalAmountCents,
                isRefund: true,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": purchase[0].companyId
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body[0].id).toBe(purchase[0].id);
        expect(body[0].isRefund).toBe(true);
    });

    test("POST /purchase Update Purchase Update All Fields", async () => {
        const purchase = await createPurchase();
        const requestBodies = [
            {
                quickBooksId: purchase[0].quickBooksId,
                totalAmountCents: 150000,
                isRefund: true,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": purchase[0].companyId
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

    test("POST /purchase Invalid companyId Type", async () => {
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": "123"
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Invalid quickBooksId Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                quickBooksId: "not-a-number",
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Invalid totalAmountCents Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: "fifty-thousand",
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Invalid isRefund Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: "true",
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Empty companyId", async () => {
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": ""
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Empty purchaseId", async () => {
        const requestBodies = [
            {
                totalAmountCents: 100000,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": "company-id",
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Missing isRefund Field", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: 50000,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Missing totalAmountCents Field", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
            {
                quickBooksId: 12345,
                isRefund: false,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Missing companyId Field", async () => {
        const requestBodies = [
            {
                quickBooksId: 12345,
                totalAmountCents: 50000,
                isRefund: false,
            },
        ];

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
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
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
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
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

    /** 
    test("POST /purchase Update Multiple Purchases in Batch", async () => {
        const purchase1 = await createPurchase();
        const purchase2 = await createPurchase();
        const purchase3 = await createPurchase();

        const requestBodies = [
            {
                quickBooksId: purchase1[0].quickBooksId,
                totalAmountCents: 200000,
                isRefund: false,
            },
            {
                quickBooksId: purchase2[0].quickBooksId,
                totalAmountCents: 10,
                isRefund: true,
            },
            {
                quickBooksId: purchase3[0].quickBooksId,
                totalAmountCents: 300000,
                isRefund: true,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId":  purchase1.companyId
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveLength(3);
        expect(body[0].id).toBe(purchase1[0].id);
        expect(body[0].totalAmountCents).toBe(200000);
        expect(body[1].quickBooksId).toBe(purchase2[0].quickBooksId);
        expect(body[1].totalAmountCents).toBe(requestBodies[1].totalAmountCents);
        expect(body[1].isRefund).toBe(true);
        expect(body[2].id).toBe(purchase3[0].id);
        expect(body[2].totalAmountCents).toBe(300000);
        expect(body[2].isRefund).toBe(true);
    });

    
    test("POST /purchase Mixed Create and Update in Batch", async () => {
        const existingPurchase = await createPurchase();

        const requestBodies = [
            {
                quickBooksId: 11111,
                totalAmountCents: 50000,
                isRefund: false,
            },
            {
                quickBooksId: existingPurchase[0].quickBooksId,
                totalAmountCents: 150000,
                isRefund: false,
            },
            {
                quickBooksId: 22222,
                totalAmountCents: 75000,
                isRefund: true,
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": existingPurchase.companyId
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
        expect(body[2].quickBooksId).toBe(22222);
    });
    */

    test("POST /purchase Batch with One Invalid Entry Returns 400", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = [
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
        ];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Empty Batch Array", async () => {
        const requestBodies: any[] = [];

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": "0199e5bb-9e51-78b7-ad43-9c8b4fddec57"
            },
            body: JSON.stringify(requestBodies),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchase Large Batch of Purchases", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBodies = Array.from({ length: 50 }, (_, i) => ({
            quickBooksId: 10000 + i,
            totalAmountCents: 50000 + i * 1000,
            isRefund: i % 2 === 0,
        }));

        const response = await app.request(TESTING_PREFIX + "/purchase/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "companyId": createdCompanyJSON?.id,
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
