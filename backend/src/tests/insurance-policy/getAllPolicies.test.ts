import { Hono } from "hono";
import { beforeAll, beforeEach, describe, afterEach, test, expect } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { startTestApp } from "../setup-tests";
import CompanySeeder from "../../database/seeds/company.seed";
import { TESTING_PREFIX } from "../../utilities/constants";
import { insurancePolicySeedData, InsurancePolicySeeder } from "../../database/seeds/insurancePolicy.seed";

describe("POST /insurance/bulk", () => {
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

        const policySeeder = new InsurancePolicySeeder();
        await policySeeder.run(dataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("GET /insurance - Success", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "GET",
            headers: {
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        });
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        const seededForCompany = insurancePolicySeedData.slice(0, 3);

        expect(JSON.stringify(responseBody.map((element: any) => element?.id))).toBe(
            JSON.stringify(seededForCompany.map((element) => element.id))
        );
        expect(JSON.stringify(responseBody.map((element: any) => element?.policyHolderFirstName))).toBe(
            JSON.stringify(seededForCompany.map((element) => element.policyHolderFirstName))
        );
        expect(JSON.stringify(responseBody.map((element: any) => element?.policyHolderLastName))).toBe(
            JSON.stringify(seededForCompany.map((element) => element.policyHolderLastName))
        );
        expect(JSON.stringify(responseBody.map((element: any) => element?.insuranceCompanyName))).toBe(
            JSON.stringify(seededForCompany.map((element) => element.insuranceCompanyName))
        );
        expect(JSON.stringify(responseBody.map((element: any) => element?.policyNumber))).toBe(
            JSON.stringify(seededForCompany.map((element) => element.policyNumber))
        );
        expect(JSON.stringify(responseBody.map((element: any) => element?.insuranceType))).toBe(
            JSON.stringify(seededForCompany.map((element) => element.insuranceType))
        );
    });

    test("GET /insurance - A company without any policies returns the empty list", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "GET",
            headers: {
                companyId: "12345678-9abc-1234-5678-56789abcdef0",
            },
        });
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.length).toBe(0);
    });
});
