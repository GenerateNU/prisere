import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { LocationAddressSeeder, seededLocationAddresses } from "../../database/seeds/locationAddress.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { seededLocations } from "../../database/seeds/location.seed";

describe("Location Address Controller Tests", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
        const companySeeder = new CompanySeeder();
        const locationAddressSeeder = new LocationAddressSeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);
        await locationAddressSeeder.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    describe("GET /location-address - Get Location Address", () => {
        test("should successfully retrieve an existing location address", async () => {
            const addressId = "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f";

            // Now retrieve it using query parameter
            const response = await app.request(TESTING_PREFIX + `/location-address/${addressId}`, {
                method: "GET",
                headers: {
                    companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                },
            });
            const data = await response.json();
            expect(response.status).toBe(200);
            expect(data.id).toBe(addressId);
            expect(data.country).toBe(seededLocationAddresses[5].country);
            expect(data.stateProvince).toBe(seededLocationAddresses[5].stateProvince);
            expect(data.city).toBe(seededLocationAddresses[5].city);
            expect(data.streetAddress).toBe(seededLocationAddresses[5].streetAddress);
            expect(data.postalCode).toBe(seededLocationAddresses[5].postalCode);
            expect(data.companyId).toBe(seededLocationAddresses[5].companyId);
        });

        test("should return 404 for non-existent id", async () => {
            const response = await app.request(
                TESTING_PREFIX + "/location-address/b82951e8-e30d-4c84-8d02-c28f29143101",
                {
                    method: "GET",
                    headers: {
                        companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                    },
                }
            );

            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data).toHaveProperty("error");
        });

        test("should handle empty string id", async () => {
            const response = await app.request(TESTING_PREFIX + "/location-address/", {
                method: "GET",
                headers: {
                    companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                },
            });

            expect(response.status).toBe(404);
            expect(response.ok).toBe(false);
        });

        test("should handle an invalid UUID", async () => {
            const response = await app.request(TESTING_PREFIX + "/location-address/6ba7b810-9dad-11d1-804fd430c8", {
                method: "GET",
                headers: {
                    companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                },
            });

            expect(response.status).toBe(500);
            expect(response.ok).toBe(false);
        });
    });
});
