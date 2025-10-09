import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("Test deleting disaster notifications", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    let testData: TestDataSetup;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        backup.restore();
        testData = await createTestData(dataSource, true); // true = include notifications
    });

    test("Delete notification", async () => {
        const response = await app.request(TESTING_PREFIX + `/disasterNotification/${testData.notifications!.notification1.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(response.status).toBe(200);

        const response2 = await app.request(TESTING_PREFIX + `/disasterNotification/${testData.notifications!.notification2.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(response2.status).toBe(200);
    });

    test("Delete notification returns 400 on non-UUID format ID", async () => {
        const response = await app.request(TESTING_PREFIX + `/disasterNotification/${testData.notifications!.notification1.id}-fake`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toMatch(/Invalid notification ID format/);
    });

    test("Delete notification returns 404 on non-existent ID", async () => {
        const response = await app.request(TESTING_PREFIX + `/disasterNotification/${randomUUID()}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toMatch(/ERROR: Notification ID not found/);
    });
});
