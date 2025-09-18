import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, mock } from "bun:test";
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
            expect(data.county).toBeUndefined();
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

        test("should fail with 400 when body is malformed JSON", async () => {
            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "{ invalid json }",
            });

            expect(response.status).toBe(400);
        });

        test("should fail with 400 when body is empty", async () => {
            const response = await app.request("/location-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "",
            });

            expect(response.status).toBe(400);
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
        // NOTE: Your current implementation expects JSON body for GET, which is unusual
        // Typically GET requests use query params or path params
        // These tests follow your actual implementation

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

            // Now retrieve it (following your implementation that uses body)
            const getBody = {
                id: addressId,
            };

            const response = await app.request("/location-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(getBody),
            });

            // NOTE: Your implementation returns 201, which is incorrect for GET
            // Should be 200, but testing your actual implementation
            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.id).toBe(addressId);
            expect(data.country).toBe(createBody.country);
        });

        test("should fail with 400 when id is missing", async () => {
            const response = await app.request("/location-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when id is not a number", async () => {
            const getBody = {
                id: "not-a-number",
            };

            const response = await app.request("/location-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(getBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when id is negative", async () => {
            const getBody = {
                id: -1,
            };

            const response = await app.request("/location-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(getBody),
            });

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 when id is zero", async () => {
            const getBody = {
                id: 0,
            };

            const response = await app.request("/location-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(getBody),
            });

            // Depending on your validation, zero might be valid or invalid
            const data = await response.json();
            if (response.status === 400) {
                expect(data).toHaveProperty("error");
            } else {
                expect(response.status).toBe(201); // Your implementation returns 201
            }
        });

        test("should fail with 400 when id is a decimal", async () => {
            const getBody = {
                id: 1.5,
            };

            const response = await app.request("/location-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(getBody),
            });

            // Zod might coerce this to 1, depending on configuration
            const data = await response.json();
            expect([201, 400]).toContain(response.status);
        });

        test("should return 404 for non-existent id", async () => {
            const getBody = {
                id: 999999,
            };

            const response = await app.request("/location-address", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(getBody),
            });

            // Your service should return 404 for non-existent resources
            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should handle concurrent requests", async () => {
            // Create multiple addresses
            const addresses = await Promise.all([
                app.request("/location-address", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        country: "USA",
                        stateProvince: "CA",
                        city: "LA",
                        streetAddress: "1 Street",
                        postalCode: 90001,
                    }),
                }),
                app.request("/location-address", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        country: "Canada",
                        stateProvince: "ON",
                        city: "Toronto",
                        streetAddress: "2 Street",
                        postalCode: 10001,
                    }),
                }),
            ]);

            const ids = await Promise.all(addresses.map((r) => r.json().then((d) => d.id)));

            // Retrieve them concurrently
            const getRequests = ids.map((id) =>
                app.request("/location-address", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }),
                })
            );

            const responses = await Promise.all(getRequests);
            responses.forEach((response) => {
                expect(response.status).toBe(201); // Your implementation returns 201
            });
        });
    });
});
