import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("Bulk create disaster notifications", () => {
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
        testData = await createTestData(dataSource, false); // false = don't create notifications yet
    });

    test("Bulk create successfully creates multiple notifications", async () => {
        const requestBody = [
            {
                userId: testData.users.user1.id,
                femaDisasterId: testData.disasters.disaster1.id,
                notificationType: "web",
            },
            {
                userId: testData.users.user2.id,
                femaDisasterId: testData.disasters.disaster2.id,
                notificationType: "email",
            },
        ];

        const response = await app.request(TESTING_PREFIX + `/notifications/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();

        const body = JSON.parse(responseText);

        expect(response.status).toBe(201);
        expect(body).toHaveLength(2);
        expect(body[0].id).not.toBe(body[1].id);
        expect(body[0].userId).toBe(testData.users.user1.id);
        expect(body[1].userId).toBe(testData.users.user2.id);
        expect(body[0].femaDisasterId).toBe(testData.disasters.disaster1.id);
        expect(body[1].femaDisasterId).toBe(testData.disasters.disaster2.id);
        expect(body[0].notificationType).toBe("web");
        expect(body[1].notificationType).toBe("email");
        expect(body[0].firstSentAt).toBeDefined();
        expect(body[1].firstSentAt).toBeDefined();
    });

    test("Single notification creation works", async () => {
        const requestBody = [
            {
                userId: testData.users.user1.id,
                femaDisasterId: testData.disasters.disaster1.id,
                notificationType: "web",
            },
        ];

        const response = await app.request(TESTING_PREFIX + `/notifications/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const responseText = await response.text();

        const body = JSON.parse(responseText);

        expect(response.status).toBe(201);
        expect(body).toHaveLength(1);
        expect(body[0].userId).toBe(testData.users.user1.id);
        expect(body[0].femaDisasterId).toBe(testData.disasters.disaster1.id);
        expect(body[0].notificationType).toBe("web");
        expect(body[0].notificationStatus).toBe("unread");
    });

    test("Bulk create returns 404 for invalid userId", async () => {
        const invalidUserId = randomUUID();
        const requestBody = [
            {
                userId: invalidUserId,
                femaDisasterId: testData.disasters.disaster1.id,
                notificationType: "web",
            },
        ];

        const response = await app.request(TESTING_PREFIX + `/notifications/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(404);
    });
});
