import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { LocationAddressSeeder } from "../../database/seeds/locationAddress.seed";

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

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);

        const LocationAddress = new LocationAddressSeeder();
        await LocationAddress.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    describe("PATCH /location-address - Update Location Address", () => {
        test("should successfully update a location address with all fields", async () => {
            const requestBody = {
                id: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b",
                alias: "Business Locations numero uno",
                country: "USA",
                stateProvince: "MA",
                city: "Boston",
                streetAddress: "744 Columbus Ave",
                postalCode: "02120",
                county: "Suffolk",
            };

            const response = await app.request(TESTING_PREFIX + "/location-address", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    companyId: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(200);
            const responseBody = await response.json();
            expect(responseBody.alias).toBe("Business Locations numero uno");
            expect(responseBody.country).toBe("USA");
            expect(responseBody.stateProvince).toBe("MA");
            expect(responseBody.city).toBe("Boston");
            expect(responseBody.streetAddress).toBe("744 Columbus Ave");
            expect(responseBody.postalCode).toBe("02120");
            expect(responseBody.county).toBe("Suffolk");
        }, 10000);

        test("should successfully update a location address with partial fields given", async () => {
            const requestBody = {
                id: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b",
                alias: "Business Locations numero uno",
            };

            const response = await app.request(TESTING_PREFIX + "/location-address", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    companyId: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(200);
            const responseBody = await response.json();
            expect(responseBody.alias).toBe("Business Locations numero uno");
            expect(responseBody.country).toBe("USA");
            expect(responseBody.stateProvince).toBe("CA");
            expect(responseBody.city).toBe("Los Angeles");
            expect(responseBody.streetAddress).toBe("123 Main St - business");
            expect(responseBody.postalCode).toBe("90001");
            expect(responseBody.county).toBe("Los Angeles");
        }, 10000);

        test("should fail - invalid id", async () => {
            const requestBody = {
                id: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e89",
                alias: "Business Locations numero uno",
            };

            const response = await app.request(TESTING_PREFIX + "/location-address", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(500);
        });

        test("should fail - location not associated with id", async () => {
            const requestBody = {
                id: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
                alias: "Business Locations numero uno",
            };

            const response = await app.request(TESTING_PREFIX + "/location-address", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    companyId: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(500);
        });
    });
});
