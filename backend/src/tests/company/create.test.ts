import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { TESTING_PREFIX } from "../../utilities/constants";
import { ContextVariables } from "../../types/Utils";
import CompanySeeder from "../../database/seeds/company.seed";
import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import UserSeeder from "../../database/seeds/user.seed";

describe("GET /comapnies/:id", () => {
    let app: Hono<{ Variables: ContextVariables }>;
    let backup: IBackup;
    let datasource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        datasource = testAppData.dataSource;
    });

    afterEach(async () => {
        backup.restore();
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

        const userSeeder = new UserSeeder();
        await userSeeder.run(datasource, {} as SeederFactoryManager);
    });

    test("POST /companies - All Fields Given - String Date 2", async () => {
        const requestBody = {
            name: "Cool Company",
        };
        const response = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
            body: JSON.stringify(requestBody),
        });

        const response2 = await app.request(TESTING_PREFIX + "/users", {
            method: "GET",
            headers: {
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
        expect(body.lastQuickBooksImportTime).toBe(null);

        const userResponse = await response2.json();
        expect(response2.status).toBe(200);
        expect(userResponse).toMatchObject({
            id: "0199e0cc-4e92-702c-9773-071340163ae4",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            companyId: body.id,
        });
    });

    test("POST /companies - All Fields Given - String Date 1", async () => {
        const requestBody = {
            name: "Cool Company",
        };
        const response = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
        expect(body.lastQuickBooksImportTime).toBe(null);
    });

    test("POST /companies - All Fields Given, Date Object", async () => {
        const requestBody = {
            name: "Cool Company",
        };
        const response = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.name).toBe(requestBody.name);
        expect(body.lastQuickBooksImportTime).toBe(null);
    });

    test("POST /companies - Name is empty", async () => {
        const requestBody = {
            name: "",
        };
        const response = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(400);
    });

    test("POST /companies - Name not given", async () => {
        const requestBody = {
            lastQuickBooksImportTime: new Date(2025, 11, 25, 9, 30, 0, 0),
        };
        const response = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(400);
    });

    test("POST /companies - Unsupported name type", async () => {
        const requestBody = {
            name: 1,
        };
        const response = await app.request(TESTING_PREFIX + "/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(400);
    });
});
