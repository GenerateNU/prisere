import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";

describe("Bulk create disaster notifications", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    let testData: TestDataSetup;

    beforeAll(async () => {
        console.log("Starting test app setup");
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
        console.log("Test app setup complete");
    });

    beforeEach(async () => {
        console.log("Restoring backup and creating test data");
        backup.restore();
        testData = await createTestData(dataSource, false); // false = don't create notifications yet
        console.log("Test data created:", {
            user1Id: testData.users.user1.id,
            user2Id: testData.users.user2.id,
            disaster1Id: testData.disasters.disaster1.id,
            disaster2Id: testData.disasters.disaster2.id,
        });
    });

    test("Bulk create successfully creates multiple notifications", async () => {
        console.log("Testing bulk create with multiple notifications");

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

        console.log("Request body:", JSON.stringify(requestBody, null, 2));

        const response = await app.request(`/disasterNotification/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        console.log("Response status:", response.status);
        // console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        let body;
        try {
            body = JSON.parse(responseText);
            console.log("Parsed response body:", JSON.stringify(body, null, 2));
        } catch (e) {
            console.error("Failed to parse response as JSON:", e);
            console.log("Response text:", responseText);
        }

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
        console.log("Testing single notification creation");

        const requestBody = [
            {
                userId: testData.users.user1.id,
                femaDisasterId: testData.disasters.disaster1.id,
                notificationType: "web",
            },
        ];

        console.log("Request body:", JSON.stringify(requestBody, null, 2));

        const response = await app.request(`/disasterNotification/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        console.log("Response status:", response.status);

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        let body;
        try {
            body = JSON.parse(responseText);
            console.log("Parsed response body:", JSON.stringify(body, null, 2));
        } catch (e) {
            console.error("Failed to parse response as JSON:", e);
        }

        expect(response.status).toBe(201);
        expect(body).toHaveLength(1);
        expect(body[0].userId).toBe(testData.users.user1.id);
        expect(body[0].femaDisasterId).toBe(testData.disasters.disaster1.id);
        expect(body[0].notificationType).toBe("web");
        expect(body[0].notificationStatus).toBe("unread");
    });

    test("Verify test data creation", async () => {
        console.log("Verifying test data creation");

        // Check if users exist in database
        const userRepo = dataSource.getRepository("User");
        const users = await userRepo.find();
        console.log("Users in database:", users.length);
        console.log("User details:", users);

        const disasterRepo = dataSource.getRepository("FemaDisaster");
        const disasters = await disasterRepo.find();
        console.log("Disasters in database:", disasters.length);
        console.log("Disaster details:", disasters);

        console.log("Test data verification:", {
            user1InDb: users.find((u) => u.id === testData.users.user1.id),
            user2InDb: users.find((u) => u.id === testData.users.user2.id),
            disaster1InDb: disasters.find((d) => d.id === testData.disasters.disaster1.id),
            disaster2InDb: disasters.find((d) => d.id === testData.disasters.disaster2.id),
        });
    });

    test("Bulk create returns 404 for invalid userId", async () => {
        console.log("Testing invalid userId");

        const invalidUserId = randomUUID();
        const requestBody = [
            {
                userId: invalidUserId,
                femaDisasterId: testData.disasters.disaster1.id,
                notificationType: "web",
            },
        ];

        console.log("Request body:", JSON.stringify(requestBody, null, 2));

        const response = await app.request(`/disasterNotification/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        console.log("Response status:", response.status);

        const responseText = await response.text();
        console.log("Raw response:", responseText);
        console.log("Expected: 404, Got:", response.status);
    });
});
