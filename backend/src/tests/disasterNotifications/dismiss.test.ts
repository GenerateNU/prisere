import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";

describe("Test dismiss disaster notifications", () => {
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

    test("Dismiss disaster notification", async () => {
        const response = await app.request(
            `/disasterNotification/${testData.notifications!.notification1.id}/dismiss`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.notificationStatus).toBe("read");

        // Test dismissing already dismissed notification
        const response2 = await app.request(
            `/disasterNotification/${testData.notifications!.notification1.id}/dismiss`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        expect(response2.status).toBe(200);
        const body2 = await response2.json();
        expect(body2.notificationStatus).toBe("read");
    });

    test("Dismiss fake notification returns 404", async () => {
        const response = await app.request(`/disasterNotification/${randomUUID()}/dismiss`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toMatch(/Notification not found/);
    });

    test("Invalid notification ID format returns 400", async () => {
        const response = await app.request(
            `/disasterNotification/${testData.notifications!.notification1.id}-asdf/dismiss`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toMatch(/Invalid notification ID format/);
    });
});
