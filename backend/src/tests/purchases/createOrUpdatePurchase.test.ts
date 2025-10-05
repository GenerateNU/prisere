import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { CreateOrPatchPurchaseDTO } from "../../modules/purchase/types";
import { CreateCompanyResponse } from "../../types/Company";

describe("POST /purchases", () => {
    let app: Hono;
    let backup: IBackup;
    let createdCompanyJSON: CreateCompanyResponse;

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

        createdCompanyJSON = await createCompanyResponse.json();
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        await createCompany();
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /purchases - Create Purchase - All Required Fields", async () => {
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
        expect(body.quickBooksID).toBe(requestBody.quickBooksId);
        expect(body.totalAmountCents).toBe(requestBody.totalAmountCents);
        expect(body.isRefund).toBe(false);
        expect(body.id).toBeDefined();
        expect(body.dateCreated).toBeDefined();
    });

    test("POST /purchases - Create Purchase - With isRefund True", async () => {
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
        expect(body.quickBooksID).toBe(requestBody.quickBooksId);
        expect(body.totalAmountCents).toBe(requestBody.totalAmountCents);
        expect(body.isRefund).toBe(true);
    });

    test("POST /purchases - Create Purchase - With isRefund False", async () => {
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
        const requestBody = {
            purchaseId: "purchase-123",
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
        const requestBody = {
            purchaseId: "purchase-456",
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
        const requestBody = {
            purchaseId: "purchase-789",
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
        expect(body.quickBooksID).toBe(requestBody.quickBooksId);
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
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
        const requestBody = {
            companyId: createdCompanyJSON.id,
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
