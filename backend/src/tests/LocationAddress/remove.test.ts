import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Company } from "../../entities/Company";

describe("Remove Address Tests", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    let companyId: string;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        backup.restore();
        const companySeeder = new CompanySeeder();
        await companySeeder.run(dataSource, {} as SeederFactoryManager);
        const companies = await dataSource.getRepository(Company).find();
        companyId = companies[0].id;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("error if id does not match any location", async () => {
        const removeResponse = await app.request(
            TESTING_PREFIX + `/location-address/e6b07e08-3435-4a4e-86bc-2e6995788ad9`,
            {
                method: "DELETE",
            }
        );

        expect(removeResponse.status).toBe(400);
    });

    test("properly removed the location with given id", async () => {
        const requestBody = {
            country: "United States",
            stateProvince: "California",
            city: "San Francisco",
            streetAddress: "123 Main Street",
            postalCode: "94105",
            county: "San Francisco County",
        };

        const response = await app.request(TESTING_PREFIX + "/location-address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const location = await response.json();
        const locationId = location.id;

        expect(response.status).toBe(201);

        const removeResponse = await app.request(TESTING_PREFIX + `/location-address/${locationId}`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(204);

        const getRemovedResponse = await app.request(TESTING_PREFIX + `/location-address/${locationId}`, {
            method: "GET",
        });
        expect(getRemovedResponse.status).toBe(404);
    });

    test("should return 400 for invalid UUID format", async () => {
        const removeResponse = await app.request(TESTING_PREFIX + `/location-address/not-a-valid-uuid`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(400);
    });

    test("should return 400 for empty string id", async () => {
        const removeResponse = await app.request(TESTING_PREFIX + `/location-address/`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(404);
    });

    test("should return 204 with no content body", async () => {
        const createBody = {
            country: "United States",
            stateProvince: "California",
            city: "San Francisco",
            streetAddress: "123 Main Street",
            postalCode: "94105",
            county: "San Francisco County",
        };

        const createResponse = await app.request(TESTING_PREFIX + "/location-address", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify(createBody),
        });

        expect(createResponse.status).toBe(201);
        const location = await createResponse.json();
        const locationId = location.id;

        const removeResponse = await app.request(TESTING_PREFIX + `/location-address/${locationId}`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(204);
        const body = await removeResponse.text();
        expect(body).toBe("");

        const getRemovedResponse = await app.request(TESTING_PREFIX + `/location-address/${locationId}`, {
            method: "GET",
        });

        expect(getRemovedResponse.status).toBe(404);
    });
});
