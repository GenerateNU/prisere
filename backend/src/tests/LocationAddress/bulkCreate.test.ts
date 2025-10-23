import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder, { seededCompanies } from "../../database/seeds/company.seed";
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
    let company_id = seededCompanies[0].id;

    beforeEach(async () => {
        backup.restore();
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);
        const companies = await dataSource.getRepository(Company).find();
        company_id = companies[0].id;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("should successfully create locations address with all required fields", async () => {
        const requestBody = [
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "94105",
                county: "San Francisco County",
            },
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "124 Main Street",
                postalCode: "94105",
                county: "San Francisco County",
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: company_id,
            },
            body: JSON.stringify(requestBody),
        });

        const body = await response.json();
        expect(response.status).toBe(201);
        expect(body.length).toBe(2);
        expect(body[0].streetAddress).toBe(requestBody[0].streetAddress);
        expect(body[1].streetAddress).toBe(requestBody[1].streetAddress);
        expect(body[0].fipsCountyCode).toBeDefined();
        expect(body[0].fipsStateCode).toBeDefined();
        expect(body[1].fipsCountyCode).toBeDefined();
        expect(body[1].fipsStateCode).toBeDefined();
    });

    test("should successfully create a location address with all required fields", async () => {
        const requestBody = [
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "94105",
                county: "San Francisco County",
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: company_id,
            },
            body: JSON.stringify(requestBody),
        });

        const body = await response.json();
        expect(response.status).toBe(201);
        expect(body.length).toBe(1);
        expect(body[0].streetAddress).toBe(requestBody[0].streetAddress);
        expect(body[0].fipsCountyCode).toBeDefined();
        expect(body[0].fipsStateCode).toBeDefined();
    });

    test("should fail if the given list is empty", async () => {
        const requestBody: unknown = [];

        const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: company_id,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("should fail if any one element has a missing field - streetAddress", async () => {
        const requestBody = [
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                postalCode: "94105",
                county: "San Francisco County",
            },
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "124 Main Street",
                postalCode: "94105",
                county: "San Francisco County",
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: company_id,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("should fail if any one element has a missing field - postalCode", async () => {
        const requestBody = [
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "123 Main Street",
                postalCode: "94105",
                county: "San Francisco County",
            },
            {
                country: "United States",
                stateProvince: "California",
                city: "San Francisco",
                streetAddress: "124 Main Street",
                county: "San Francisco County",
            },
        ];

        const response = await app.request(TESTING_PREFIX + "/location-address/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: company_id,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });
});
