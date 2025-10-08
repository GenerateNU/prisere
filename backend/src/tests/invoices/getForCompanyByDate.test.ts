import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("Invoice get by id", () => {
    let app: Hono;
    let backup: IBackup;
    let createdCompanyId: string;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;

        const response = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test Company" }),
        });
        const body = await response.json();
        createdCompanyId = body.id;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("should return the sum of invoices in the valid date range", async () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const invoices: any[] = [
            {
                companyId: createdCompanyId,
                totalAmountCents: 45,
                dateCreated: tenDaysAgo,
            },
            {
                companyId: createdCompanyId,
                totalAmountCents: 50,
                dateCreated: fiveDaysAgo,
            },
            {
                companyId: createdCompanyId,
                totalAmountCents: 80,
                dateCreated: threeDaysAgo,
            },
        ];

        await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoices),
        });

        const response = await app.request(
            `/quickbooks/invoice/bulk/${createdCompanyId}/totalIncome?startDate=${tenDaysAgo.toISOString()}&endDate=${fiveDaysAgo.toISOString()}`
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body).toBe(95);
    });

    test("should return 0 if no invoices in the valid date range", async () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(fiveDaysAgo.getDate() - 3);

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const invoices: any[] = [
            {
                companyId: createdCompanyId,
                totalAmountCents: 45,
                dateCreated: tenDaysAgo,
            },
            {
                companyId: createdCompanyId,
                totalAmountCents: 50,
                dateCreated: fiveDaysAgo,
            },
            {
                companyId: createdCompanyId,
                totalAmountCents: 50,
                dateCreated: threeDaysAgo,
            },
        ];

        await app.request("/quickbooks/invoice/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoices),
        });

        const response = await app.request(
            `/quickbooks/invoice/bulk/${createdCompanyId}/totalIncome?startDate=${twoDaysAgo.toISOString()}&endDate=${new Date().toISOString()}`
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body).toBe(0);
    });

    test("should return 400 if invalid dates", async () => {
        const response = await app.request(
            `/quickbooks/invoice/bulk/${createdCompanyId}/totalIncome?startDate=${new Date().toISOString()}&endDate=${new Date().toISOString()}`
        );
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Start date must be before End date");
    });

    test("should return 400 if invalid companyID", async () => {
        const response = await app.request(
            `/quickbooks/invoice/bulk/bla/totalIncome?startDate=${new Date().toISOString()}&endDate=${new Date().toISOString()}`
        );
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body).toHaveProperty("error");
        expect(body.error).toBe("Invalid company ID format");
    });
});
