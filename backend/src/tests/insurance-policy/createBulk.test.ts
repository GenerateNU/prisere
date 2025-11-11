import { Hono } from "hono";
import { beforeAll, beforeEach, describe, afterEach, test, expect } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { startTestApp } from "../setup-tests";
import CompanySeeder from "../../database/seeds/company.seed";
import { TESTING_PREFIX } from "../../utilities/constants";
import { InsurancePolicySeeder } from "../../database/seeds/insurancePolicy.seed";

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

    test("POST /insurance/bulk - Success with two creations at once", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify([
                {
                    policyName: "Policy A",
                    policyHolderFirstName: "Gusto",
                    policyHolderLastName: "Torres",
                    insuranceCompanyName: "State Farm",
                    policyNumber: "SF-VEH-67",
                    insuranceType: "Auto",
                },
                {
                    policyName: "Policy A",
                    policyHolderFirstName: "Brusto",
                    policyHolderLastName: "Fortune",
                    insuranceCompanyName: "UHC",
                    policyNumber: "UHC-HEALTH-3204928",
                    insuranceType: "Healthcare",
                },
            ]),
        });
        expect(response.status).toBe(201);
        const responseBody = await response.json();

        expect(responseBody.length).toBe(2);
        expect(responseBody[0].policyName).toBe("Policy A");
        expect(responseBody[0].policyHolderFirstName).toBe("Gusto");
        expect(responseBody[0].policyHolderLastName).toBe("Torres");
        expect(responseBody[0].insuranceCompanyName).toBe("State Farm");
        expect(responseBody[0].policyNumber).toBe("SF-VEH-67");
        expect(responseBody[0].insuranceType).toBe("Auto");

        expect(responseBody[1].policyName).toBe("Policy A");
        expect(responseBody[1].policyHolderFirstName).toBe("Brusto");
        expect(responseBody[1].policyHolderLastName).toBe("Fortune");
        expect(responseBody[1].insuranceCompanyName).toBe("UHC");
        expect(responseBody[1].policyNumber).toBe("UHC-HEALTH-3204928");
        expect(responseBody[1].insuranceType).toBe("Healthcare");
    });

    test("POST /insurance/bulk - error when object does not have an insurance type", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify([
                {
                    policyName: "Policy A",
                    policyHolderFirstName: "Gusto",
                    policyHolderLastName: "Torres",
                    insuranceCompanyName: "State Farm",
                    policyNumber: "SF-VEH-67",
                },
                {
                    policyName: "Policy A",
                    policyHolderFirstName: "Brusto",
                    policyHolderLastName: "Fortune",
                    insuranceCompanyName: "UHC",
                    policyNumber: "UHC-HEALTH-3204928",
                    insuranceType: "Healthcare",
                },
            ]),
        });
        expect(response.status).toBe(400);
    });

    test("POST /insurance/bulk - Success with two creations at once", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance/bulk", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            },
            body: JSON.stringify([]),
        });
        expect(response.status).toBe(400);
    });
});
