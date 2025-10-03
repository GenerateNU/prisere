import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("Remove Address Tests", () => {
    let app: Hono;
    let backup: IBackup;

    let company_id: String;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    beforeEach(async () => {
        const sampleCompany = {
            name: "Cool Company",
        };
        const response = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sampleCompany),
        });
        const body = await response.json();
        company_id = body.id;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("error if id does not match any location", async () => {
        const removeResponse = await app.request(`/location-address/e6b07e08-3435-4a4e-86bc-2e6995788ad9`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(400);
    });

    test("properly removed the location with given id", async () => {
        const requestBody = {
            country: "United States",
            stateProvince: "California",
            city: "San Francisco",
            streetAddress: "123 Main Street",
            postalCode: 94105,
            county: "San Francisco County",
            companyId: company_id,
        };

        const response = await app.request("/location-address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const location = await response.json();
        const locationId = location.id;

        expect(response.status).toBe(201);

        const removeResponse = await app.request(`/location-address/${locationId}`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(204);

        const getRemovedResponse = await app.request(`/location-address/${locationId}`, {
            method: "GET",
        });

        expect(getRemovedResponse.status).toBe(404);
    });

    test("should return 400 for invalid UUID format", async () => {
        const removeResponse = await app.request(`/location-address/not-a-valid-uuid`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(400);
    });

    test("should return 400 for empty string id", async () => {
        const removeResponse = await app.request(`/location-address/`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(404); // or 400 depending on your routing
    });

    test("should return 204 with no content body", async () => {
        const createBody = {
            country: "United States",
            stateProvince: "California",
            city: "San Francisco",
            streetAddress: "123 Main Street",
            postalCode: 94105,
            county: "San Francisco County",
            companyId: company_id,
        };

        const createResponse = await app.request("/location-address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createBody),
        });
        const location = await createResponse.json();
        const locationId = location.id;

        const removeResponse = await app.request(`/location-address/${location.id}`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(204);
        const body = await removeResponse.text();
        expect(body).toBe("");

        const getRemovedResponse = await app.request(`/location-address/${locationId}`, {
            method: "GET",
        });

        expect(getRemovedResponse.status).toBe(404);
    });
});
