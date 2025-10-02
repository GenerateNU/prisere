import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("Location Address Controller Tests", () => {
    let app: Hono;
    let backup: IBackup;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    afterEach(async () => {
        backup.restore();
    });

    describe("GET /location-address - Get Location Address", () => {
        test("should successfully retrieve an existing location address", async () => {
            // First create a location address
            const createBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: 94105,
            };

            const createResponse = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(createBody),
            });

            const createdAddress = await createResponse.json();
            const addressId = createdAddress.id;

            // Now retrieve it using query parameter
            const response = await app.request(`/location-address/${addressId}`, {
                method: "GET",
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.id).toBe(addressId);
            expect(data.country).toBe(createBody.country);
            expect(data.stateProvince).toBe(createBody.stateProvince);
            expect(data.city).toBe(createBody.city);
            expect(data.streetAddress).toBe(createBody.streetAddress);
            expect(data.postalCode).toBe(createBody.postalCode);
        });

        test("should return 404 for non-existent id", async () => {
            const response = await app.request("/location-address/b82951e8-e30d-4c84-8d02-c28f29143101", {
                method: "GET",
            });

            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should handle empty string id", async () => {
            const response = await app.request("/location-address/", {
                method: "GET",
            });

            expect(response.status).toBe(404);
            expect(response.ok).toBe(false);
        });

        test("should handle an invalide UUID", async () => {
            const response = await app.request("/location-address/testing", {
                method: "GET",
            });

            expect(response.status).toBe(400);
            expect(response.ok).toBe(false);
        });
    });
});
