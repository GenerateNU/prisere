import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { beforeEach } from "node:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder, { seededCompanies } from "../../database/seeds/company.seed";
import { TESTING_PREFIX } from "../../utilities/constants";
import { startTestApp } from "../setup-tests";

describe("POST /disasters/self", () => {
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
        const companySeeder = new CompanySeeder();
        await companySeeder.run(testAppDataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /disaster/self - Success", async () => {
        const requestBody = {
            // name: "Test Disaster",
            description: "This is my desc.",
            startDate: new Date().toISOString().split("T")[0],
            endDate: undefined,
        };

        const response = await app.request(TESTING_PREFIX + "/disaster/self", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: seededCompanies[0].id,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.description).toBe(requestBody.description);
        expect(body.companyId).toBe(seededCompanies[0].id);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        const deleteResponse = await app.request(TESTING_PREFIX + "/disaster/self/" + body.id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                companyId: seededCompanies[0].id,
            },
        });

        //Check to see if the entity exists
        expect(deleteResponse.status).toBe(200);
    });

    test("POST /disaster/self - Bad company id", async () => {
        const requestBody = {
            name: "Test Disaster",
            description: "This is my desc.",
            startDate: new Date().toISOString().split("T")[0],
            endDate: undefined,
        };

        const response = await app.request(TESTING_PREFIX + "/disaster/self", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: "8df1f862-fe01-401d-a90f-8d364bc96ab2",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(500);
    });

    test("POST /disaster/self - Missing description", async () => {
        const requestBody = {
            name: "Test Disaster",
            description: undefined,
            startDate: new Date().toISOString().split("T")[0],
            endDate: undefined,
        };

        const response = await app.request(TESTING_PREFIX + "/disaster/self", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: seededCompanies[0].id,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /disaster/self - Success with non open end", async () => {
        const requestBody = {
            name: "Test Disaster",
            description: "This is my desc.",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date("10/20/2026").toISOString().split("T")[0],
        };

        const response = await app.request(TESTING_PREFIX + "/disaster/self", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: seededCompanies[0].id,
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.description).toBe(requestBody.description);
        expect(body.companyId).toBe(seededCompanies[0].id);
        expect(body.startDate.split("T")[0]).toBe(requestBody.startDate);
        expect(body.endDate.split("T")[0]).toBe(requestBody.endDate);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        const deleteResponse = await app.request(TESTING_PREFIX + "/disaster/self/" + body.id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                companyId: seededCompanies[0].id,
            },
        });

        //Check to see if the entity exists
        expect(deleteResponse.status).toBe(200);
    });
});
