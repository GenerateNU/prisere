import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { seededLocationAddresses } from "../../database/seeds/location.seed";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Company } from "../../entities/Company";

describe("Location Address Controller Tests", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    // Use the company ID from the seeded data
    let company_id = "ffc8243b-876e-4b6d-8b80-ffc73522a838";

    beforeEach(async () => {
        backup.restore();
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);
        const companies = await dataSource.getRepository(Company).find();
        company_id = companies[0].id;
        console.log("Companies after seeding:", companies.map(c => ({ id: c.id, name: c.name })));
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
                postalCode: "94105",
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

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).toHaveProperty("id");
            expect(data.country).toBe(requestBody.country);
            expect(data.stateProvince).toBe(requestBody.stateProvince);
            expect(data.city).toBe(requestBody.city);
            expect(data.streetAddress).toBe(requestBody.streetAddress);
            expect(data.postalCode).toBe(requestBody.postalCode);
            expect(data.county).toBe(requestBody.county);
            expect(data.companyId).toBe(requestBody.companyId);
        });

        test("should successfully create a location address without optional county field", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "94105",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
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
                postalCode: "94105",
                companyId: company_id,
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
                postalCode: "94105",
                companyId: company_id,
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

        test("should fail with 400 when postalCode is not a string", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: 94105, // number instead of string
                companyId: company_id,
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
                postalCode: "-94105",
                companyId: company_id,
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

        test("should fail with 400 when postalCode contains non-numeric characters", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "z41*5",
                companyId: company_id,
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

        test("should return 400 if companyId not added", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "94105",
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

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should fail with 400 for invalid company ID", async () => {
            const requestBody = {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "94105",
                companyId: "invalid-company-id",
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
    });
});