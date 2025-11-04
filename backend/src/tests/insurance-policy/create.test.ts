import { Hono } from "hono";
import { beforeAll, beforeEach, describe, afterEach, test, expect } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { startTestApp } from "../setup-tests";
import CompanySeeder from "../../database/seeds/company.seed";
import { TESTING_PREFIX } from "../../utilities/constants";
import { InsurancePolicySeeder } from "../../database/seeds/insurancePolicy.seed";

describe("POST /insurance", () => {
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

    test("POST /insurance - Success", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderFirstName: "Gusto",
                policyHolderLastName: "Torres",
                insuranceCompanyName: "State Farm",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
            }),
        });
        expect(response.status).toBe(201);
        const responseBody = await response.json();
        expect(responseBody.policyName).toBe("Policy A");
        expect(responseBody.policyHolderFirstName).toBe("Gusto");
        expect(responseBody.policyHolderLastName).toBe("Torres");
        expect(responseBody.insuranceCompanyName).toBe("State Farm");
        expect(responseBody.policyNumber).toBe("SF-VEH-67");
        expect(responseBody.insuranceType).toBe("Auto");
    });

    test("POST /insurance - Ensure that users cannot edit company records that are not their own", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderFirstName: "Gusto",
                policyHolderLastName: "Torres",
                insuranceCompanyName: "State Farm",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
                companyId: "11111111-1122-1111-1111-11111111",
            }),
        });

        //Would throw 500 if the company ID was accepted because the given companyID DNE
        expect(response.status).toBe(201);
    });

    test("POST /insurance - empty first name causes error", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderFirstName: "",
                policyHolderLastName: "Torres",
                insuranceCompanyName: "State Farm",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
                companyId: "11111111-1111-1111-1111-11111111",
            }),
        });
        expect(response.status).toBe(400);
    });

    test("POST /insurance - missing first name causes error", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderLastName: "Torres",
                insuranceCompanyName: "State Farm",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
                companyId: "11111111-1111-1111-1111-11111111",
            }),
        });
        expect(response.status).toBe(400);
    });

    test("POST /insurance - empty last name causes error", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderFirstName: "Gusto",
                policyHolderLastName: "",
                insuranceCompanyName: "State Farm",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
                companyId: "11111111-1111-1111-1111-11111111",
            }),
        });
        expect(response.status).toBe(400);
    });

    test("POST /insurance - missing last name causes error", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderFirstName: "Gusto",
                insuranceCompanyName: "State Farm",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
                companyId: "11111111-1111-1111-1111-11111111",
            }),
        });
        expect(response.status).toBe(400);
    });

    test("POST /insurance - empty insurance comapany causes error", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderFirstName: "Gusto",
                policyHolderLastName: "Torres",
                insuranceCompanyName: "",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
                companyId: "11111111-1111-1111-1111-11111111",
            }),
        });
        expect(response.status).toBe(400);
    });

    test("POST /insurance - missing insurance company causes error", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify({
                policyName: "Policy A",
                policyHolderFirstName: "Gusto",
                policyHolderLastName: "Torres",
                policyNumber: "SF-VEH-67",
                insuranceType: "Auto",
                companyId: "11111111-1111-1111-1111-11111111",
            }),
        });
        expect(response.status).toBe(400);
    });
});
