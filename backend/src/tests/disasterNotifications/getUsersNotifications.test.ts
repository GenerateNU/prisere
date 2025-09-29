import { Hono } from "hono";
import { describe, test, expect, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { logMessageToFile } from "../../utilities/logger";
import { randomUUID } from "crypto";

describe("Test getting a users disaster notifications", () => {
    let app: Hono;
    let backup: IBackup;
    let createdUserId: String;
    let createdUserId2: String;
    let createdDisasterId: String;
    let createdDisasterId2: String;

    const userRequestBody = {
        firstName: "Alice",
        lastName: "Bob",
        email: "alice@prisere.com",
        // companyId: "2df402d0-bff3-408e-9ca6-62744bd4f735"
    };
    const disasterRequestBody = {
        femaId: randomUUID(),
        disasterNumber: 1011,
        state: 23,
        declarationDate: "2025-09-28T00:00:00.000Z",
        startDate: "2025-09-29T00:00:00.000Z",
        endDate: "2025-10-05T00:00:00.000Z",
        fipsCountyCode: 12345,
        declarationType: "11",
        designatedArea: "County A",
        designatedIncidentTypes: "1",
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    beforeEach(async () => {
        backup.restore();

        // create users and disasters for tests
        const userResponse = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userRequestBody),
        });
        const userBody = await userResponse.json();
        console.log(userBody);
        createdUserId = userBody.id;
        logMessageToFile(`Created ID: ${createdUserId}`);

        const userResponse2 = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userRequestBody),
        });
        const userBody2 = await userResponse2.json();
        createdUserId2 = userBody2.id;
        logMessageToFile(`Created ID: ${createdUserId2}`);

        const disasterRequestBody1 = {
            ...disasterRequestBody,
            femaId: randomUUID(),
        };
        const disasterRequestBody2 = {
            ...disasterRequestBody,
            femaId: randomUUID(),
        };
        const disasterResponse = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(disasterRequestBody1),
        });
        const disasterBody = await disasterResponse.json();

        createdDisasterId = disasterBody.femaId;
        logMessageToFile(`Created ID: ${createdDisasterId}`);

        const disasterResponse2 = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(disasterRequestBody2),
        });
        const disasterBody2 = await disasterResponse2.json();
        createdDisasterId2 = disasterBody2.femaId;

        logMessageToFile(`Created ID: ${createdDisasterId2}`);
        const requestBody = [
            {
                userId: createdUserId,
                femaDisasterId: createdDisasterId,
                notificationType: "web",
            },
            {
                userId: createdUserId2,
                femaDisasterId: createdDisasterId2,
                notificationType: "email",
            },
        ];
        const response = await app.request(`/disasterNotification/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        console.log(response.json());
    });

    test("GET users disaster notifications", async () => {
        const response = await app.request(`/disasterNotification/${createdUserId}`);
        expect(response.status).toBe(200);
        const body = await response.json();

        expect(body.id);
        expect(body.userId);
        expect(body.femaDisasterId);
        expect(body.notificationType);
        expect(body.notificationStatus);

        const response2 = await app.request(`/disasterNotification/${createdUserId}`);
        expect(response2.status).toBe(200);
        const body2 = await response2.json();
        console.log("mmmmmmmmmmmmmm");
        console.log(body2);
        expect(body2.id);
        expect(body2.userId);
        expect(body2.femaDisasterId);
        expect(body2.notificationType);
        expect(body2.notificationStatus);
    });

    test("GET fake user returns 404 user not found", async () => {
        const response = await app.request(`/disasterNotification/${randomUUID()}`);
        expect(response.status).toBe(404);
        const body = await response.json();
        expect(body.error).toMatch(/user not found/);
    });

    test("GET user ID with incorrect format returns a 400", async () => {
        const response = await app.request(`/disasterNotification/user-id}`);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toMatch(/Invalid user ID format/);
    });
});
