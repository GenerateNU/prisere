import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { initTestData } from "./setup";
import { DataSource } from "typeorm";
import { beforeEach } from "node:test";
import { ClaimStatusType } from "../../types/ClaimStatusType";
import { seededCompanies } from "../../database/seeds/company.seed";
import { TESTING_PREFIX } from "../../utilities/constants";
import { SeederFactoryManager } from "typeorm-extension";
import { insurancePolicySeedData, InsurancePolicySeeder } from "../../database/seeds/insurancePolicy.seed";

describe("POST /claims", () => {
    let app: Hono;
    let backup: IBackup;
    let testAppDataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        testAppDataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        await initTestData(testAppDataSource);

        const policySeeder = new InsurancePolicySeeder();
        await policySeeder.run(testAppDataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /claims - Success", async () => {
        const companyId = "c0ce685a-27d8-4183-90ff-31f294b2c6da";
        const requestBody = {
            femaDisasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
            insurancePolicyId: insurancePolicySeedData[0].id,
        };

        const response = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.femaDisasterId).toBe(requestBody.femaDisasterId);
        expect(body.insurancePolicyId).toBe(requestBody.insurancePolicyId);
        expect(body.companyId).toBe(companyId);
        expect(body.status).toBe(ClaimStatusType.ACTIVE);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        const fetchResponse = await app.request(TESTING_PREFIX + `/claims/company`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
        });
        const fetchBody = await fetchResponse.json();

        expect(fetchResponse.status).toBe(200);
        expect(fetchBody.length).toBe(2);
        expect(fetchBody[1].id).toBe(body.id);
        expect(fetchBody[1].femaDisaster.id).toBe(requestBody.femaDisasterId);
        expect(fetchBody[1].insurancePolicy.id).toBe(requestBody.insurancePolicyId);
        expect(fetchBody[1].companyId).toBe(companyId);
    });

    test("POST /claims - Success", async () => {
        const requestBody = {
            selfDisasterId: "ba5735c4-fbd1-4f7d-97c1-bf5af2a3f533",
        };
        const companyId = seededCompanies[0].id;

        const response = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.femaDisasterId).toBe(null);
        expect(body.selfDisasterId).toBe(requestBody.selfDisasterId);
        expect(body.companyId).toBe(companyId);
        expect(body.status).toBe(ClaimStatusType.ACTIVE);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        const fetchResponse = await app.request(TESTING_PREFIX + `/claims/company`, {
            headers: {
                companyId: companyId,
            },
        });
        const fetchBody = await fetchResponse.json();

        expect(fetchResponse.status).toBe(200);
        expect(fetchBody.length).toBe(1);
        expect(fetchBody[0].id).toBe(body.id);
        expect(fetchBody[0].selfDisaster.id).toBe(requestBody.selfDisasterId);
        expect(fetchBody[0].companyId).toBe(companyId);
    });

    test("POST /claims - Company with multiple claims", async () => {
        const companyId = "a1a542da-0abe-4531-9386-8919c9f86369";
        const requestBody2 = {
            femaDisasterId: "47f0c515-2efc-49c3-abb8-623f48817950",
        };

        const response2 = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify(requestBody2),
        });

        expect(response2.status).toBe(201);
        const body2 = await response2.json();
        expect(body2.femaDisasterId).toBe(requestBody2.femaDisasterId);
        expect(body2.companyId).toBe(companyId);
        expect(body2.status).toBe(ClaimStatusType.ACTIVE);
        expect(body2.createdAt).toBeDefined();
        expect(body2.updatedAt).toBeDefined();
    });

    test("POST /claims - CompanyID doesnt exist", async () => {
        const companyId = "c290f1ee-6c54-4b01-90e6-d701748f0851";
        const requestBody = {
            femaDisasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
        };

        const response = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(500);
    });

    test("POST /claims - DisasterID doesnt exist", async () => {
        const requestBody = {
            femaDisasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6e2",
        };

        const response = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(500);
    });

    test("POST /claims - Missing Fields", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims - Empty Fields", async () => {
        const requestBody = {
            disasterId: "",
        };

        const response = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims - Empty Request Body", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    });
});
