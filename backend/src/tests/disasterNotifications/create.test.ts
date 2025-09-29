import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { logMessageToFile } from "../../utilities/logger";
import { randomUUID } from "crypto";

describe("Bulk create disaster notifications", () => {
    let app: Hono;
    let backup: IBackup;
    let createdUserId: String;
    let createdUserId2: String;
    let createdDisasterId: String;
    let createdDisasterId2: String;
    const hardCodedDisasterId = "a8a1f7e2-4b3d-4c9a-9e7f-123456789abc"
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
        designatedIncidentTypes: "1"
    }

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;

        // create users and disasters for tests
        const userResponse = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userRequestBody),
        });
        const userBody = await userResponse.json();
        console.log(userBody)
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

        // const disasterResponse = await app.request("/disaster", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(disasterRequestBody),
        // });
        // const disasterBody = await disasterResponse.json();
        // console.log(disasterBody)
        // createdDisasterId = disasterBody.id;
        // logMessageToFile(`Created ID: ${createdDisasterId}`);

        // const disasterResponse2 = await app.request("/disaster", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(disasterRequestBody),
        // });
        // const disasterBody2 = await disasterResponse2.json();
        // createdDisasterId2 = disasterBody2.id;
        // logMessageToFile(`Created ID: ${createdDisasterId2}`);

    });

    afterEach(async () => {
        backup.restore();
    })

    test("Bulk create", async () => {
        const requestBody = [
            {
                userId: createdUserId,
                femaDisasterId: hardCodedDisasterId,
                notificationType: 'web'
            },
            {
                userId: createdUserId2,
                femaDisasterId: hardCodedDisasterId,
                notificationType: 'email'
            }
        ]
        const response = await app.request(`/disasterNotification/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
        const body = await response.json();
        console.log(body)
    })
})