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
            method: 'DELETE'
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
        console.log(locationId);

        expect(response.status).toBe(201);

        const removeResponse = await app.request(`/location-address/${locationId}`, {
            method: 'DELETE'
        });

        expect(removeResponse.status).toBe(204);

    });

});