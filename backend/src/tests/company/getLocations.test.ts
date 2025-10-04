import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

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
    let createdCompanyId: string;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    beforeEach(async () => {
        backup.restore();

        const response = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test Company" }),
        });
        const body = await response.json();
        createdCompanyId = body.id;
    });

    test("should return empty array when company has no locations", async () => {
        const response = await app.request(`/companies/${createdCompanyId}/location-address`);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
    });

    test("should return all locations when company has more than one location", async () => {
        const locations = [
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main St",
                postalCode: "94105",
                companyId: createdCompanyId,
            },
            {
                country: "United States",
                stateProvince: "New York",
                city: "New York",
                streetAddress: "456 Broadway",
                postalCode: "10013",
                companyId: createdCompanyId,
            },
            {
                country: "United States",
                stateProvince: "Texas",
                city: "Austin",
                streetAddress: "789 Queen St",
                postalCode: "10001",
                county: "Texas County",
                companyId: createdCompanyId,
            },
        ];

        for (const location of locations) {
            await app.request("/location-address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(location),
            });
        }

        const response = await app.request(`/companies/${createdCompanyId}/location-address`);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(3);

        data.forEach((location: any) => {
            expect(location.companyId).toBe(createdCompanyId);
        });

        locations.forEach((expectedLocation) => {
            const matchingLocation = data.find(
                (loc: any) => loc.city === expectedLocation.city && loc.streetAddress === expectedLocation.streetAddress
            );

            expect(matchingLocation).toBeDefined();
            expect(matchingLocation.country).toBe(expectedLocation.country);
            expect(matchingLocation.stateProvince).toBe(expectedLocation.stateProvince);
            expect(matchingLocation.postalCode).toBe(expectedLocation.postalCode);
            expect(matchingLocation.companyId).toBe(expectedLocation.companyId);

            if (expectedLocation.county) {
                expect(matchingLocation.county).toBe(expectedLocation.county);
            }
        });
    });

    test("should return 400 when company ID is not a valid UUID", async () => {
        const response = await app.request("/companies/invalid-uuid/location-address");

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty("error");
    });

    test("should only return locations for the specified company", async () => {
        const otherCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Other Company" }),
        });
        const otherCompany = await otherCompanyResponse.json();
        const otherCompanyId = otherCompany.id;

        await app.request("/location-address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main St",
                postalCode: "94105",
                companyId: createdCompanyId,
            }),
        });

        await app.request("/location-address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                country: "United States",
                stateProvince: "Texas",
                city: "Austin",
                streetAddress: "789 Congress Ave",
                postalCode: "78701",
                companyId: otherCompanyId,
            }),
        });

        const response = await app.request(`/companies/${createdCompanyId}/location-address`);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.length).toBe(1);
        expect(data[0].companyId).toBe(createdCompanyId);
        expect(data[0].city).toBe("San Francisco");
    });
});
