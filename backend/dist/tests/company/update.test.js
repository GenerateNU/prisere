import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
describe("Company - Update lastQuickBooksImportTime", () => {
    let app;
    let backup;
    let companyId;
    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        // Create a company to update later
        const createResponse = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Update Test Company" }),
        });
        const created = await createResponse.json();
        companyId = created.id;
    });
    afterEach(async () => {
        backup.restore();
    });
    test("PATCH /companies/:id/quickbooks-import-time - Valid date", async () => {
        const newDate = new Date("2025-12-25T09:30:00.000Z");
        const response = await app.request(`/companies/${companyId}/quickbooks-import-time`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ importTime: newDate.toISOString() }), // <-- use importTime
        });
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.lastQuickBooksImportTime).toBe(newDate.toISOString());
    });
    test("PATCH /companies/:id/quickbooks-import-time - Invalid date string", async () => {
        const response = await app.request(`/companies/${companyId}/quickbooks-import-time`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ importTime: "not-a-date" }), // <-- use importTime
        });
        expect(response.status).toBe(400);
    });
    test("PATCH /companies/:id/quickbooks-import-time - Missing date", async () => {
        const response = await app.request(`/companies/${companyId}/quickbooks-import-time`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });
    test("PATCH /companies/:id/quickbooks-import-time - Non-existent company", async () => {
        const newDate = new Date("2025-12-25T09:30:00.000Z");
        const response = await app.request(`/companies/non-existent-id/quickbooks-import-time`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ importTime: newDate.toISOString() }), // <-- use importTime
        });
        expect(response.status).toBe(500);
    });
});
