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

    test("PATCH /insurance/bulk - Success", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance/bulk", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
            body: JSON.stringify([
                {
                    id: "a9847596-eb93-4026-8ad1-62ada283e0b6",
                    policyName: "New Policy A",
                    policyHolderFirstName: "Sarah But New",
                    policyHolderLastName: "Johnson But New",
                    insuranceCompanyName: "Blue Cross Blue Shield Gross ew",
                    policyNumber: "BCBS-HL-123456",
                    insuranceType: "Health New",
                },
                {
                    id: "d2320343-e464-47c4-97a6-6b5ea795e095",
                    policyName: "Policyyyyyyy",
                    policyHolderFirstName: "Mikey",
                    insuranceCompanyName: "Allstate (are you in good hands?)",
                },
            ]),
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody[0].policyName).toBe("New Policy A");
        expect(responseBody[0].policyHolderFirstName).toBe("Sarah But New");
        expect(responseBody[0].policyHolderLastName).toBe("Johnson But New");
        expect(responseBody[0].insuranceCompanyName).toBe("Blue Cross Blue Shield Gross ew");
        expect(responseBody[0].policyNumber).toBe("BCBS-HL-123456");
        expect(responseBody[0].insuranceType).toBe("Health New");
        expect(responseBody[1].policyName).toBe("Policyyyyyyy");
        expect(responseBody[1].policyHolderFirstName).toBe("Mikey");
        expect(responseBody[1].policyHolderLastName).toBe("Chen");
        expect(responseBody[1].insuranceCompanyName).toBe("Allstate (are you in good hands?)");
    });

    test("PATCH /insurance - one fails", async () => {
        const response = await app.request(TESTING_PREFIX + "/insurance", {
            method: "PATCH",
            body: JSON.stringify([
                {
                    id: "a9847596-eb93-4026-8ad1-62ada283e0b6",
                    policyName: "New Policy A",
                    policyHolderFirstName: "Sarah But New",
                    policyHolderLastName: "Johnson But New",
                    insuranceCompanyName: "Blue Cross Blue Shield Gross ew",
                    policyNumber: "BCBS-HL-123456",
                    insuranceType: "Health New",
                },
                {
                    id: "d2320343-e464-47c4-97a6-6b5ea798383",
                    policyName: "Policyyyyyyy",
                    policyHolderFirstName: "Mikey",
                    insuranceCompanyName: "Allstate (are you in good hands?)",
                },
            ]),
        });

        expect(response.status).toBe(400);
    });
});
