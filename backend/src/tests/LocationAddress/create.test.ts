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

    describe("POST /location-address - Create Location Address", () => {
        test("should successfully create a location address with all required fields", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: 94105,
                county: "San Francisco County",
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).toHaveProperty("id");
            expect(data.country).toBe(requestBody.country);
            expect(data.stateProvince).toBe(requestBody.stateProvince);
            expect(data.city).toBe(requestBody.city);
            expect(data.streetAddress).toBe(requestBody.streetAddress);
            expect(data.postalCode).toBe(requestBody.postalCode);
            expect(data.county).toBe(requestBody.county);
        });

        test("should successfully create a location address without optional county field", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: 94105,
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).toHaveProperty("id");
            expect(data.county).toBeNull();
        });

        test("should fail with 400 when country is missing", async () => {
            const requestBody = {
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: 94105,
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when country is empty string", async () => {
            const requestBody = {
                country: "",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: 94105,
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when postalCode is not a number", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "94105", // String instead of number
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when postalCode is negative", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: -94105,
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 500 when body is malformed JSON", async () => {
            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "{ invalid json }",
            });

            expect(response.status).toBe(500);
        });

        test("should fail with 500 when body is empty", async () => {
            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "",
            });

            expect(response.status).toBe(500);
        });

        test("should handle addresses with special characters", async () => {
            const requestBody = {
                country: "España",
                stateProvince: "Île-de-France",
                city: "São Paulo",
                streetAddress: "Straße 123, Apt #456 & Suite 7/8",
                postalCode: 12345,
                county: "O'Brien County",
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.country).toBe(requestBody.country);
            expect(data.streetAddress).toBe(requestBody.streetAddress);
            expect(data.county).toBe(requestBody.county);
        });

        test("should handle very long field values", async () => {
            const longString = "A".repeat(1000);
            const requestBody = {
                country: longString,
                stateProvince: longString,
                city: longString,
                streetAddress: longString,
                postalCode: 99999,
                county: longString,
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(201).toBe(response.status);
        });

        test("should reject extra fields not in schema", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: 94105,
                extraField: "should not be allowed",
                anotherExtra: 123,
            };

            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).not.toHaveProperty("extraField");
            expect(data).not.toHaveProperty("anotherExtra");
        });
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
    });
});
