/**
 *
 * - id that exists
 * - id that does not exist
 * - no id
 * - wrong type id (not string)
 * - SQL Injection...
 *
 */

import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("Example", () => {
    let app: Hono;
    let backup: IBackup;
    let createdCompanyId: String;
    const requestBody = {
        name: "Test Company",
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;

        const response = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        const body = await response.json();
        createdCompanyId = body.id;
        console.log("Created ID: ", createdCompanyId);
    });

    beforeEach(async () => {
        backup.restore(); // Restore to clean state before each test

        // Re-create the company for each test and save ID
        const response = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test Company" }),
        });
        const body = await response.json();
        createdCompanyId = body.id;
    });

    test("GET /companies/:id - id that exists", async () => {
        const response = await app.request(`/companies/${createdCompanyId}`);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
    });

    test("GET /companies/:id - validates response structure", async () => {
        const response = await app.request(`/companies/${createdCompanyId}`);
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("name");
        expect(body.id).toBe(createdCompanyId);
        expect(typeof body.id).toBe("string");
        expect(typeof body.name).toBe("string");
    });

    test("GET /companies/:id - error response structure", async () => {
        const nonExistentUUID = "12345678-1234-1234-1234-123456789012";
        const response = await app.request(`/companies/${nonExistentUUID}`);
        expect(response.status).toBe(404);

        const body = await response.json();
        expect(body).toHaveProperty("error");
        expect(typeof body.error).toBe("string");
    });

    test("GET /companies/:id - id that does not exist", async () => {
        const nonExistentUUID = "12345678-1234-1234-1234-123456789012";
        const response = await app.request(`/companies/${nonExistentUUID}`);
        expect(response.status).toBe(404);
    });

    test("GET /companies/:id - id not in UIUD format", async () => {
        const nonExistentUUID = "baka";
        const response = await app.request(`/companies/${nonExistentUUID}`);
        expect(response.status).toBe(400);
    });

    test("GET /companies/:id - uuid with invalid characters", async () => {
        const response = await app.request("/companies/1234567g-1234-1234-1234-123456789012"); // g is not hex
        expect(response.status).toBe(400);
    });

    test("GET /companies/:id - no id", async () => {
        const response = await app.request("/companies/");
        expect([400, 404]).toContain(response.status);
    });

    test("GET /companies/:id - white space", async () => {
        const response = await app.request("/companies/   ");
        expect([400, 404]).toContain(response.status);
    });

    test("GET /companies/:id - concurrent requests", async () => {
        const requests = Array(10)
            .fill(null)
            .map(() => app.request(`/companies/${createdCompanyId}`));

        const responses = await Promise.all(requests);
        responses.forEach((response) => {
            expect(response.status).toBe(200);
        });
    });
});
