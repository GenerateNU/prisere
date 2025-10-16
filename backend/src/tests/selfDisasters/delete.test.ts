import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { beforeEach } from "node:test";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { seededSelfDisasters, SelfDisasterSeeder } from "../../database/seeds/selfDisaster.seed";

describe("DELETE /disasters/self/:id", () => {
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
        const selfDisasterSeeder = new SelfDisasterSeeder();
        await selfDisasterSeeder.run(testAppDataSource, {} as SeederFactoryManager);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("DELETE /disaster/self/:id - Success", async () => {
        const deleteResponse = await app.request("/disaster/self/" + seededSelfDisasters[0].id, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        expect(deleteResponse.status).toBe(200);
    });

    test("DELETE /disaster/self/:id - Delete a non-existant disaster", async () => {
        const deleteResponse = await app.request("/disaster/self/" + "00000000-0000-0000-0000-000000000000", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        expect(deleteResponse.status).toBe(404);
    });
});
