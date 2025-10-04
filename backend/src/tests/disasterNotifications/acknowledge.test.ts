import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";

describe("Test acknowledge disaster notifications", () => {
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

    test("Acknowledge disaster notification", async () => {
        const response = await app.request(
            `/disasterNotification/${testData.notifications!.notification1.id}/acknowledge`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.notificationStatus).toBe("acknowledged");
    });

    test("Acknowledge fake notification returns 404", async () => {
        const response = await app.request(`/disasterNotification/${randomUUID()}/acknowledge`, {
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
            `/disasterNotification/${testData.notifications!.notification1.id}-asdf/acknowledge`,
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
