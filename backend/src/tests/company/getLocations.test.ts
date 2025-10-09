import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import CompanySeeder from "../../database/seeds/company.seed";
import { LocationAddressSeeder } from "../../database/seeds/location.seed";

/**
 * Test:
 * - More than one location
 * - No locations
 * - invalid id -> not uuid
 * - only returns locations for the specified company
 */

describe("Get all locations for a company", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;

    // Seeded company IDs from company.seed.ts
    const companyWithMultipleLocations = "ffc8243b-876e-4b6d-8b80-ffc73522a838"; // 3 locations
    const companyWithOneLocation = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"; // 1 location
    const companyWithNoLocations = "11b2c3d4-e5f6-7890-abcd-ef1234567890"; // 0 locations

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;
    });

    beforeEach(async () => {
        backup.restore();
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);
        const locationSeeder = new LocationAddressSeeder();
        await locationSeeder.run(datasource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("should return empty array when company has no locations", async () => {
        const response = await app.request(`/companies/${companyWithNoLocations}/location-address`);
        const data = await response.json();

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
    });

    test("should return all locations when company has more than one location", async () => {
        const response = await app.request(`/companies/${companyWithMultipleLocations}/location-address`);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(3);

        // Verify all locations belong to the correct company
        data.forEach((location: any) => {
            expect(location.companyId).toBe(companyWithMultipleLocations);
        });

        // Verify specific seeded locations are present
        const cities = data.map((loc: any) => loc.city);
        expect(cities).toContain("Miami");
        expect(cities).toContain("Houston");
        expect(cities).toContain("Los Angeles");

        // Verify FIPS codes are present
        data.forEach((location: any) => {
            expect(location.fipsStateCode).toBeDefined();
            expect(location.fipsCountyCode).toBeDefined();
            expect(typeof location.fipsStateCode).toBe("number");
            expect(typeof location.fipsCountyCode).toBe("number");
        });
    });

    test("should return single location when company has one location", async () => {
        const response = await app.request(`/companies/${companyWithOneLocation}/location-address`);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(1);

        const location = data[0];
        expect(location.companyId).toBe(companyWithOneLocation);
        expect(location.city).toBe("New York");
        expect(location.stateProvince).toBe("New York");
        expect(location.fipsStateCode).toBe(36);
        expect(location.fipsCountyCode).toBe(61);
    });

    test("should return 400 when company ID is not a valid UUID", async () => {
        const response = await app.request("/companies/invalid-uuid/location-address");

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should only return locations for the specified company", async () => {
        // Test that company A's locations don't include company B's locations
        const companyAResponse = await app.request(`/companies/${companyWithMultipleLocations}/location-address`);
        const companyBResponse = await app.request(`/companies/${companyWithOneLocation}/location-address`);

        expect(companyAResponse.status).toBe(200);
        expect(companyBResponse.status).toBe(200);

        const companyAData = await companyAResponse.json();
        const companyBData = await companyBResponse.json();

        // Company A should have 3 locations
        expect(companyAData.length).toBe(3);
        companyAData.forEach((location: any) => {
            expect(location.companyId).toBe(companyWithMultipleLocations);
        });

        // Company B should have 1 location
        expect(companyBData.length).toBe(1);
        expect(companyBData[0].companyId).toBe(companyWithOneLocation);

        // Verify no overlap in location IDs
        const companyALocationIds = companyAData.map((loc: any) => loc.id);
        const companyBLocationIds = companyBData.map((loc: any) => loc.id);

        companyALocationIds.forEach((id: string) => {
            expect(companyBLocationIds).not.toContain(id);
        });
    });

    test("should return 404 for non-existent", async () => {
        const nonExistentCompanyId = "99999999-9999-9999-9999-999999999999";
        const response = await app.request(`/companies/${nonExistentCompanyId}/location-address`);

        expect(response.status).toBe(400);
    });

    test("should verify location data integrity", async () => {
        const response = await app.request(`/companies/${companyWithMultipleLocations}/location-address`);

        expect(response.status).toBe(200);
        const data = await response.json();

        data.forEach((location: any) => {
            // Verify required fields are present
            expect(location.id).toBeDefined();
            expect(location.country).toBeDefined();
            expect(location.stateProvince).toBeDefined();
            expect(location.city).toBeDefined();
            expect(location.streetAddress).toBeDefined();
            expect(location.postalCode).toBeDefined();
            expect(location.companyId).toBe(companyWithMultipleLocations);

            // Verify FIPS codes are valid numbers
            expect(typeof location.fipsStateCode).toBe("number");
            expect(typeof location.fipsCountyCode).toBe("number");
            expect(location.fipsStateCode).toBeGreaterThan(0);
            expect(location.fipsCountyCode).toBeGreaterThan(0);

            // Verify postal codes are strings
            expect(typeof location.postalCode).toBe("string");
            expect(location.postalCode.length).toBeGreaterThan(0);
        });
    });
});
