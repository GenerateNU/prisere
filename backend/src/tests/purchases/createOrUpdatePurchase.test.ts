import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("POST /purchases", () => {
    let app: Hono;
    let backup: IBackup;

    const createCompany = async () => {
        const companyRequest = {
            name: "Cool Company",
        };

        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(companyRequest),
        });

        return await createCompanyResponse.json();
    };

    const createPurchase = async () => {
        const createdCompany = await createCompany();
        const requestBody = {
            companyId: createdCompany.id,
            quickBooksId: 12345,
            totalAmountCents: 50000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
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

    test("POST /purchases - Create Purchase - All Required Fields", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBody = {
            companyId: createdCompanyJSON?.id,
            quickBooksId: 12345,
            totalAmountCents: 50000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.companyId).toBe(requestBody.companyId);
        expect(body.quickBooksId).toBe(requestBody.quickBooksId);
        expect(body.totalAmountCents).toBe(requestBody.totalAmountCents);
        expect(body.isRefund).toBe(false);
        expect(body.id).toBeDefined();
        expect(body.dateCreated).toBeDefined();
    });

    test("POST /purchases - Create Purchase - With isRefund True", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBody = {
            companyId: createdCompanyJSON?.id,
            quickBooksId: 67890,
            totalAmountCents: 25000,
            isRefund: true,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.companyId).toBe(requestBody.companyId);
        expect(body.quickBooksId).toBe(requestBody.quickBooksId);
        expect(body.totalAmountCents).toBe(requestBody.totalAmountCents);
        expect(body.isRefund).toBe(true);
    });

    test("POST /purchases - Create Purchase - With isRefund False", async () => {
        const createdCompanyJSON = await createCompany();

        const requestBody = {
            companyId: createdCompanyJSON?.id,
            quickBooksId: 11111,
            totalAmountCents: 75000,
            isRefund: false,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.isRefund).toBe(false);
    });

    test("POST /purchases - Patch Purchase - Update totalAmountCents", async () => {
        const purchase = await createPurchase();
        const requestBody = {
            purchaseId: purchase.id,
            totalAmountCents: 100000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.id).toBe(requestBody.purchaseId);
        expect(body.totalAmountCents).toBe(requestBody.totalAmountCents);
    });

    test("POST /purchases - Patch Purchase - Update isRefund", async () => {
        const purchase = await createPurchase();
        const requestBody = {
            purchaseId: purchase.id,
            isRefund: true,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.isRefund).toBe(true);
    });

    test("POST /purchases - Patch Purchase - Update All Fields", async () => {
        const purchase = await createPurchase();
        const requestBody = {
            purchaseId: purchase.id,
            quickBooksId: 99999,
            totalAmountCents: 150000,
            isRefund: true,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.quickBooksId).toBe(requestBody.quickBooksId);
        expect(body.totalAmountCents).toBe(requestBody.totalAmountCents);
        expect(body.isRefund).toBe(requestBody.isRefund);
    });

    test("POST /purchases - Missing companyId", async () => {
        const requestBody = {
            quickBooksId: 12345,
            totalAmountCents: 50000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Missing quickBooksId", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBody = {
            companyId: createdCompanyJSON?.id,
            totalAmountCents: 50000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Missing totalAmountCents", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBody = {
            companyId: createdCompanyJSON?.id,
            quickBooksId: 12345,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Invalid companyId Type", async () => {
        const requestBody = {
            companyId: 123,
            quickBooksId: 12345,
            totalAmountCents: 50000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Invalid quickBooksId Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBody = {
            companyId: createdCompanyJSON?.id,
            quickBooksId: "not-a-number",
            totalAmountCents: 50000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Invalid totalAmountCents Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBody = {
            companyId: createdCompanyJSON?.id,
            quickBooksId: 12345,
            totalAmountCents: "fifty-thousand",
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Invalid isRefund Type", async () => {
        const createdCompanyJSON = await createCompany();
        const requestBody = {
            companyId: createdCompanyJSON?.id,
            quickBooksId: 12345,
            totalAmountCents: 50000,
            isRefund: "true",
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Empty companyId", async () => {
        const requestBody = {
            companyId: "",
            quickBooksId: 12345,
            totalAmountCents: 50000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Patch with Invalid purchaseId Type", async () => {
        const requestBody = {
            purchaseId: 123,
            totalAmountCents: 100000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /purchases - Patch with Empty purchaseId", async () => {
        const requestBody = {
            purchaseId: "",
            totalAmountCents: 100000,
        };

        const response = await app.request("/purchases", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });
});
