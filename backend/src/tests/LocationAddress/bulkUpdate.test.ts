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

    describe("PATCH /location-address/bulk - Update Location Address in Bulk", () => {
        test("should successfully update an array of location addresses", async () => {
            const requestBody = [
                {
                    id: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
                    alias: "Business Locations numero uno",
                    stateProvince: "MA",
                    city: "Boston",
                    streetAddress: "123456 Main St - business",
                    postalCode: "02120",
                    county: "Suffolk",
                },
                {
                    id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
                    alias: "Northeastern Location 1",
                    stateProvince: "MA",
                    city: "Los Angeles",
                },
            ];

            const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(200);
            const responseBody = await response.json();
            expect(responseBody[0].alias).toBe("Business Locations numero uno");
            expect(responseBody[0].country).toBe("USA");
            expect(responseBody[0].stateProvince).toBe("MA");
            expect(responseBody[0].city).toBe("Boston");
            expect(responseBody[0].streetAddress).toBe("123456 Main St - business");
            expect(responseBody[0].postalCode).toBe("02120");
            expect(responseBody[0].county).toBe("Suffolk");
            expect(responseBody[1].alias).toBe("Northeastern Location 1");
            expect(responseBody[1].country).toBe("USA");
            expect(responseBody[1].stateProvince).toBe("MA");
            expect(responseBody[1].city).toBe("Los Angeles");
        }, 10000);

        test("One location fails - invalid id", async () => {
            const requestBody = [
                {
                    id: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b",
                    alias: "Business Locations numero uno",
                    stateProvince: "MA",
                    city: "Boston",
                    streetAddress: "123456 Main St - business",
                    postalCode: "02120",
                    county: "Suffolk",
                },
                {
                    id: "5e6f7a8b-9c0d-4e2f-8a4b-5cef",
                    alias: "Business Locations numero uno",
                },
            ];

            const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(500);
        });

        test("One location fails - location not associated with company", async () => {
            const requestBody = [
                {
                    id: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
                    alias: "Business Locations numero uno",
                    stateProvince: "MA",
                    city: "Boston",
                    streetAddress: "123456 Main St - business",
                    postalCode: "02120",
                    county: "Suffolk",
                },
                {
                    id: "b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e",
                    alias: "Northeastern Location 1",
                    stateProvince: "MA",
                    city: "Los Angeles",
                },
            ];

            const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                },
                body: JSON.stringify(requestBody),
            });

            expect(response.status).toBe(500);
        });
    });
});
