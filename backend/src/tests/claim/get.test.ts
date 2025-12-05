import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { beforeEach } from "node:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { TESTING_PREFIX } from "../../utilities/constants";
import { startTestApp } from "../setup-tests";
import { initTestData } from "./setup";

describe("GET /claims/company/:id", () => {
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
    });

    afterEach(async () => {
        backup.restore();
    });

    test("GET - Successfully Gets related claims (multiple)", async () => {
        const companyId = "5667a729-f000-4190-b4ee-7957badca27b";
        const response = await app.request(TESTING_PREFIX + "/claims/company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify({
                filters: {},
                page: 0,
                resultsPerPage: 10,
            }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.length).toBe(2);
        expect(body.data[0].companyId).toBe("5667a729-f000-4190-b4ee-7957badca27b");
        expect(body.data[1].companyId).toBe("5667a729-f000-4190-b4ee-7957badca27b");

        const companyId2 = "a1a542da-0abe-4531-9386-8919c9f86369";
        const response2 = await app.request(TESTING_PREFIX + "/claims/company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId2,
            },
            body: JSON.stringify({
                filters: {},
                page: 0,
                resultsPerPage: 10,
            }),
        });
        const body2 = await response2.json();

        expect(response2.status).toBe(200);
        expect(body2.data.length).toBe(1);
        expect(body2.data[0].companyId).toBe("a1a542da-0abe-4531-9386-8919c9f86369");
    });

    test("GET - Successfully Gets related claims (single)", async () => {
        const companyId = "a1a542da-0abe-4531-9386-8919c9f86369";
        const response = await app.request(TESTING_PREFIX + "/claims/company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify({
                filters: {},
                page: 0,
                resultsPerPage: 10,
            }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.length).toBe(1);
        expect(body.data[0].companyId).toBe("a1a542da-0abe-4531-9386-8919c9f86369");
    });

    test("GET - No related claims for companyId", async () => {
        const companyId = "c0ce685a-27d8-4183-90ff-31f294b2c6da";
        const response = await app.request(TESTING_PREFIX + "/claims/company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify({
                filters: {},
                page: 0,
                resultsPerPage: 10,
            }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.data.length).toBe(1);
    });

    test("GET - CompanyID doesn't exist", async () => {
        const companyId = "c0ce685a-27d8-4183-90ff-31f294b2c6dp";
        const response = await app.request(TESTING_PREFIX + "/claims/company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify({
                filters: {},
                page: 0,
                resultsPerPage: 10,
            }),
        });

        expect(response.status).toBe(400);
    });

    test("GET - Malformed ID", async () => {
        const companyId = "--";
        const response = await app.request(TESTING_PREFIX + "/claims/company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId,
            },
            body: JSON.stringify({
                filters: {},
                page: 0,
                resultsPerPage: 10,
            }),
        });
        expect(response.status).toBe(400);

        const companyId2 = "{}";
        const response3 = await app.request(TESTING_PREFIX + "/claims/company", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                companyId: companyId2,
            },
            body: JSON.stringify({
                filters: {},
                page: 0,
                resultsPerPage: 10,
            }),
        });
        expect(response3.status).toBe(400);
    });
});
