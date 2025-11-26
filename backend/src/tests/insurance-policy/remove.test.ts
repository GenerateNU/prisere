import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { insurancePolicySeedData, InsurancePolicySeeder } from "../../database/seeds/insurancePolicy.seed";

describe("Remove Insurance Tests", () => {
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
        const insuranceSeeder = new InsurancePolicySeeder();
        await insuranceSeeder.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("error if id does not match any insurance", async () => {
        const removeResponse = await app.request(TESTING_PREFIX + `/insurance/e6b07e08-3435-4a4e-86bc-2e6995788ad9`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(400);
    });

    test("properly removed the insurance with given id", async () => {
        const removeResponse = await app.request(TESTING_PREFIX + `/insurance/${insurancePolicySeedData[0].id}`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(204);

        const getRemovedResponse = await app.request(TESTING_PREFIX + `/insurance/${insurancePolicySeedData[0].id}`, {
            method: "GET",
        });
        expect(getRemovedResponse.status).toBe(404);
    });

    test("should return 400 for invalid UUID format", async () => {
        const removeResponse = await app.request(TESTING_PREFIX + `/insurance/not-a-valid-uuid`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(400);
    });

    test("should return 400 for empty string id", async () => {
        const removeResponse = await app.request(TESTING_PREFIX + `/insurance/`, {
            method: "DELETE",
        });

        expect(removeResponse.status).toBe(404);
    });
});
