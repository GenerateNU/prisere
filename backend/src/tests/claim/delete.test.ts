import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { initTestData } from "./setup";
import { DataSource } from "typeorm";
import { beforeEach } from "node:test";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("DELETE /claims/:id", () => {
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

    test("DELETE /claims - Successful Delete", async () => {
        const getResponseBefore = await app.request(
            TESTING_PREFIX + "/claims/company/5667a729-f000-4190-b4ee-7957badca27b"
        );
        const getBodyBefore = await getResponseBefore.json();

        expect(getBodyBefore.length).toBe(2);

        const response = await app.request(TESTING_PREFIX + "/claims/0174375f-e7c4-4862-bb9f-f58318bb2e7d", {
            method: "DELETE",
        });

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.id).toBe("0174375f-e7c4-4862-bb9f-f58318bb2e7d");

        const getResponseAfter = await app.request(
            TESTING_PREFIX + "/claims/company/5667a729-f000-4190-b4ee-7957badca27b"
        );
        const getBodyAfter = await getResponseAfter.json();

        expect(getBodyAfter.length).toBe(1);
    });

    test("DELETE /claims - Deleting a claim that doesnt exist", async () => {
        const response = await app.request(TESTING_PREFIX + `/claims/${"doesntexist"}`, {
            method: "DELETE",
        });

        expect(response.status).toBe(400);
    });

    test("DELETE /claims - Malformed id", async () => {
        const response = await app.request(TESTING_PREFIX + "/claims/2aa52e71-5f89-4efe-   a820-1bfc65ded6ec", {
            method: "DELETE",
        });

        expect(response.status).toBe(400);
    });
});
