import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { initTestData } from "./setup";
import { DataSource } from "typeorm";
import { beforeEach } from "node:test";

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
        const response = await app.request("/claims/company/5667a729-f000-4190-b4ee-7957badca27b");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.length).toBe(3);
        expect(body[0].companyId).toBe("5667a729-f000-4190-b4ee-7957badca27b");
        expect(body[1].companyId).toBe("5667a729-f000-4190-b4ee-7957badca27b");
        expect(body[2].companyId).toBe("5667a729-f000-4190-b4ee-7957badca27b");

        const response2 = await app.request("/claims/company/a1a542da-0abe-4531-9386-8919c9f86369");
        const body2 = await response2.json();

        expect(response2.status).toBe(200);
        expect(body2.length).toBe(1);
        expect(body2[0].companyId).toBe("a1a542da-0abe-4531-9386-8919c9f86369");
    });

    test("GET - Successfully Gets related claims (single)", async () => {
        const response = await app.request("/claims/company/a1a542da-0abe-4531-9386-8919c9f86369");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.length).toBe(1);
        expect(body[0].companyId).toBe("a1a542da-0abe-4531-9386-8919c9f86369");
    });

    test("GET - No related claims for companyId", async () => {
        const response = await app.request("/claims/company/c0ce685a-27d8-4183-90ff-31f294b2c6da");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.length).toBe(0);
    });

    test("GET - CompanyID doesn't exist", async () => {
        const response = await app.request("/claims/company/c0ce685a-27d8-4183-90ff-31f294b2c6dp");

        expect(response.status).toBe(400);
    });

    test("GET - Malformed ID", async () => {
        const response = await app.request("/claims/company/---");
        expect(response.status).toBe(400);

        const response3 = await app.request("/claims/company/{}");
        expect(response3.status).toBe(400);
    });
});
