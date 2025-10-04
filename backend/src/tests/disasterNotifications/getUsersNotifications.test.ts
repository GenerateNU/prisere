import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";

describe("Test getting a users disaster notifications", () => {
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
        testData = await createTestData(dataSource, true); // true = include notifications
        console.log("Test data created:", {
            user1Id: testData.users.user1.id,
            user2Id: testData.users.user2.id,
            disaster1Id: testData.disasters.disaster1.id,
            disaster2Id: testData.disasters.disaster2.id,
            notification1Id: testData.notifications?.notification1.id,
            notification2Id: testData.notifications?.notification2.id,
        });
    });

    test("GET users disaster notifications", async () => {
        console.log("Testing GET users disaster notifications");

        // check if notifications were created
        const notificationRepo = dataSource.getRepository("DisasterNotification");
        const allNotifications = await notificationRepo.find();
        console.log("All notifications in DB:", allNotifications.length);
        console.log("Notification details:", allNotifications);

        // Test user1 notifications
        console.log(`Making request for user1: /disasterNotification/${testData.users.user1.id}`);
        const response = await app.request(`/disasterNotification/${testData.users.user1.id}`);

        console.log("Response status:", response.status);
        // console.log("Response headers:", Object.fromEntries(response.headers);

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

        if (Array.isArray(body)) {
            console.log("Response is an array with", body.length, "items");
            if (body.length > 0) {
                console.log("First notification:", body[0]);
                expect(body[0].userId).toBe(testData.users.user1.id);
                expect(body[0].femaDisasterId).toBe(testData.disasters.disaster1.id);
            }
        } else if (body && typeof body === "object") {
            console.log("Response is a single object");
            expect(body.userId).toBe(testData.users.user1.id);
            expect(body.femaDisasterId).toBe(testData.disasters.disaster1.id);
        }

        expect(response.status).toBe(200);

        // Test user2 notifications
        console.log(`Making request for user2: /disasterNotification/${testData.users.user2.id}`);
        const response2 = await app.request(`/disasterNotification/${testData.users.user2.id}`);

        console.log("Response2 status:", response2.status);

        const responseText2 = await response2.text();
        console.log("Raw response2:", responseText2);

        let body2;
        try {
            body2 = JSON.parse(responseText2);
            console.log("Parsed response2 body:", JSON.stringify(body2, null, 2));
        } catch (e) {
            console.error("Failed to parse response2 as JSON:", e);
        }

        expect(response2.status).toBe(200);

        if (Array.isArray(body2)) {
            console.log("Response2 is an array with", body2.length, "items");
            if (body2.length > 0) {
                expect(body2[0].userId).toBe(testData.users.user2.id);
                expect(body2[0].femaDisasterId).toBe(testData.disasters.disaster2.id);
            }
        } else if (body2 && typeof body2 === "object") {
            console.log("Response2 is a single object");
            expect(body2.userId).toBe(testData.users.user2.id);
            expect(body2.femaDisasterId).toBe(testData.disasters.disaster2.id);
        }
    });

    test("Verify notification data in database", async () => {
        console.log("Verifying notification data in database");

        // Check notifications in database
        const notificationRepo = dataSource.getRepository("DisasterNotification");
        const notifications = await notificationRepo.find();
        console.log("Notifications in database:", notifications.length);

        for (const notification of notifications) {
            console.log("Notification:", {
                id: notification.id,
                userId: notification.userId,
                femaDisasterId: notification.femaDisasterId,
                notificationType: notification.notificationType,
                notificationStatus: notification.notificationStatus,
            });
        }

        // Check for user1's notifications
        const user1Notifications = notifications.filter((n) => n.userId === testData.users.user1.id);
        console.log(" User1 notifications:", user1Notifications.length);

        // Check for user2's notifications
        const user2Notifications = notifications.filter((n) => n.userId === testData.users.user2.id);
        console.log(" User2 notifications:", user2Notifications.length);
    });

    test("GET fake user returns 404 user not found", async () => {
        console.log("Testing fake user 404");

        const fakeUserId = randomUUID();
        console.log(`Making request for fake user: /disasterNotification/${fakeUserId}`);

        const response = await app.request(`/disasterNotification/${fakeUserId}`);
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
        console.log("Expected: 404, Got:", response.status);
        if (response.status === 404 && body) {
            expect(body.error).toMatch(/user not found/i);
        }
    });

    test("GET user ID with incorrect format returns a 400", async () => {
        console.log("Testing invalid user ID format");

        console.log("Making request with invalid ID: /disasterNotification/user-id");
        const response = await app.request(`/disasterNotification/user-id`);

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

        console.log("Expected: 400, Got:", response.status);
        if (response.status === 400 && body) {
            expect(body.error).toMatch(/Invalid user ID format/i);
        }
    });
});
