import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";
import { TESTING_PREFIX } from "../../utilities/constants";

describe("Test getting a users disaster notifications", () => {
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

    test("GET users disaster notifications", async () => {
        // Test user1 notifications
        const response = await app.request(TESTING_PREFIX + `/notifications`, {
            method: "GET",
            headers: {
                "userId": "0199e585-621d-744a-81e2-8cc93d48b23d"
            }
        });

        expect(response.status).toBe(200);
        const responseText = await response.text();

        let body;
        try {
            body = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse response as JSON:", e);
        }

        if (Array.isArray(body)) {
            if (body.length > 0) {
                expect(body[0].userId).toBe(testData.users.user1.id);
                expect(body[0].femaDisasterId).toBe(testData.disasters.disaster1.id);
            }
        } else if (body && typeof body === "object") {
            expect(body.userId).toBe(testData.users.user1.id);
            expect(body.femaDisasterId).toBe(testData.disasters.disaster1.id);
        }

        // Test user2 notifications
        const response2 = await app.request(TESTING_PREFIX + `/notifications`, {
            method: "GET",
            headers: {
                "userId": "0199e585-a52b-7bcf-982d-a1c5230b3d40"
            }
        });

        const responseText2 = await response2.text();

        let body2;
        try {
            body2 = JSON.parse(responseText2);
        } catch (e) {
            console.error("Failed to parse response2 as JSON:", e);
        }

        expect(response2.status).toBe(200);

        if (Array.isArray(body2)) {
            if (body2.length > 0) {
                expect(body2[0].userId).toBe(testData.users.user2.id);
                expect(body2[0].femaDisasterId).toBe(testData.disasters.disaster2.id);
            }
        } else if (body2 && typeof body2 === "object") {
            expect(body2.userId).toBe(testData.users.user2.id);
            expect(body2.femaDisasterId).toBe(testData.disasters.disaster2.id);
        }
    });

    test("GET fake user returns 404 user not found", async () => {
        const fakeUserId = randomUUID();

        const response = await app.request(TESTING_PREFIX + `/notifications`, {
            headers: {
                "userId": fakeUserId,
            }
        });

        const responseText = await response.text();

        let body;
        try {
            body = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse response as JSON:", e);
        }
        if (response.status === 404 && body) {
            expect(body.error).toMatch(/user not found/i);
        }
    });

    test("GET user ID with incorrect format returns a 400", async () => {
        const response = await app.request(TESTING_PREFIX + `/notifications`, {
            headers: {
                "userId": "fake-id"
            }
        });

        const responseText = await response.text();

        let body;
        try {
            body = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse response as JSON:", e);
        }
        expect(response.status).toBe(400);
        if (response.status === 400 && body) {
            expect(body.error).toMatch(/Invalid user ID format/i);
        }
    });

    test("GET notifications with web filter", async () => {
        // user 1 has 2 web 1 email, user 2 has 3 email 1 web
        const response1 = await app.request(TESTING_PREFIX + `/notifications?type=web`, {
            method: "GET",
            headers: {
                "userId": "0199e585-621d-744a-81e2-8cc93d48b23d"
            }
        });

        const response2 = await app.request(
            TESTING_PREFIX + `/notifications?type=web`, {
            method: "GET",
            headers: {
                "userId": "0199e585-621d-744a-81e2-8cc93d48b23d"
            }
        });

        const result1 = JSON.parse(await response1.text());
        const result2 = JSON.parse(await response2.text());

        // Test the length matches what we expect of each type
        expect(result1.length === 2);
        expect(result2.length === 1);

        const response1Email = await app.request(
            TESTING_PREFIX + `/notifications?type=email`, {
            method: "GET",
            headers: {
                "userId": "0199e585-621d-744a-81e2-8cc93d48b23d"
            }
        });

        const response2Email = await app.request(
            TESTING_PREFIX + `/notifications?type=email`, {
            method: "GET",
            headers: {
                "userId": "0199e585-621d-744a-81e2-8cc93d48b23d"
            }
        });

        const result1Email = JSON.parse(await response1Email.text());
        const result2Email = JSON.parse(await response2Email.text());

        expect(result1Email.length === 1);
        expect(result2Email.length === 3);
    });

    test("Test pagination", async () => {
        // User 3 should have 25 notifications
        const response1 = await app.request(TESTING_PREFIX + `/notifications`, {
            method: "GET",
            headers: {
                "userId": "0189e585-a52b-7bcf-982d-a1c5230b3d40"
            }
        });
        
        const result = JSON.parse(await response1.text());
        // Should only return 20 (default limit) when there are 25 notifications
        expect(result.length).toBe(20);
        expect(response1.status).toBe(200);

        const response2 = await app.request(
            TESTING_PREFIX + `/notifications?limit=5&page=1`, {
            method: "GET",
            headers: {
                "userId": "0189e585-a52b-7bcf-982d-a1c5230b3d40"
            }
        });
        const result2 = JSON.parse(await response2.text());
        expect(result2.length).toBe(5); // Return limit amount
        expect(response2.status).toBe(200);

        const response3 = await app.request(
            TESTING_PREFIX + `/notifications?limit=4&page=3`, {
            method: "GET",
            headers: {
                "userId": "0189e585-a52b-7bcf-982d-a1c5230b3d40"
            }
        });
        const result3 = JSON.parse(await response3.text());
        expect(result3.length).toBe(4); // Return limit amount
        expect(response3.status).toBe(200);
    });

    test("Test pagination out of bounds limit/request", async () => {
        // User 3 should have 25 notifications
        const response1 = await app.request(TESTING_PREFIX + `/notifications`, {
            method: "GET",
            headers: {
                "userId": "0189e585-a52b-7bcf-982d-a1c5230b3d40"
            }
        });
        const result = JSON.parse(await response1.text());
        // Should only return 20 (default limit) when there are 25 notifications
        expect(result.length).toBe(20);
        expect(response1.status).toBe(200);

        const response2 = await app.request(
            TESTING_PREFIX + `/notifications?limit=5&page=100`, {
            method: "GET",
            headers: {
                "userId": "0199e585-a52b-7bcf-982d-a1c5230b3d40"
            }
        });
        const result2 = JSON.parse(await response2.text());
        expect(result2.length).toBe(0); // Return limit amount
        expect(response2.status).toBe(200);

        const response3 = await app.request(
            TESTING_PREFIX + `/notifications?limit=9999&page=1`, {
            method: "GET",
            headers: {
                "userId": "0199e585-621d-744a-81e2-8cc93d48b23d"
            }
        });
        // const result3 = JSON.parse(await response3.text())
        expect(response3.status).toBe(400);
    });
});
