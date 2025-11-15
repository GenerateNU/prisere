import { Hono } from "hono";
import { beforeAll, beforeEach, describe, afterEach, test, expect } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import { startTestApp } from "../setup-tests";
import CompanySeeder from "../../database/seeds/company.seed";
import { TESTING_PREFIX } from "../../utilities/constants";
import { InsurancePolicySeeder } from "../../database/seeds/insurancePolicy.seed";

describe("PATCH /insurance", () => {
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

    test("PATCH /insurance - Success", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify({
                id: "a9847596-eb93-4026-8ad1-62ada283e0b6",
                policyName: "New Policy A",
                policyHolderFirstName: "Sarah But New",
                policyHolderLastName: "Johnson But New",
                insuranceCompanyName: "Blue Cross Blue Shield Gross ew",
                policyNumber: "BCBS-HL-123456",
                insuranceType: "Health New",
            }),
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.policyName).toBe("New Policy A");
        expect(responseBody.policyHolderFirstName).toBe("Sarah But New");
        expect(responseBody.policyHolderLastName).toBe("Johnson But New");
        expect(responseBody.insuranceCompanyName).toBe("Blue Cross Blue Shield Gross ew");
        expect(responseBody.policyNumber).toBe("BCBS-HL-123456");
        expect(responseBody.insuranceType).toBe("Health New");
    });

    test("PATCH /insurance - Success partial fields", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify({
                id: "a9847596-eb93-4026-8ad1-62ada283e0b6",
                policyName: "New Policy A",
                policyHolderFirstName: "Sarah But New",
                policyHolderLastName: "Johnson But New",
            }),
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.policyName).toBe("New Policy A");
        expect(responseBody.policyHolderFirstName).toBe("Sarah But New");
        expect(responseBody.policyHolderLastName).toBe("Johnson But New");
        expect(responseBody.insuranceCompanyName).toBe("Blue Cross Blue Shield");
        expect(responseBody.policyNumber).toBe("BCBS-HL-456789");
        expect(responseBody.insuranceType).toBe("Health");
    });

    test("PATCH /insurance - insurance doesn't exist", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify({
                id: "a9847596-eb93-4026-8ad1-62ada283eed",
                policyName: "New Policy A",
                policyHolderFirstName: "Sarah But New",
                policyHolderLastName: "Johnson But New",
            }),
        });

        expect(response.status).toBe(500);
    });

    test("PATCH /insurance - insurance policy not associated with company", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify({
                id: "b66e671e-3f68-4c67-aee9-20cdf7250326",
                policyName: "New Policy A",
                policyHolderFirstName: "Sarah But New",
                policyHolderLastName: "Johnson But New",
            }),
        });

        expect(response.status).toBe(500);
    });
});
