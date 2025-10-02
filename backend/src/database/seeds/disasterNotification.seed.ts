import { Hono } from "hono";
import { describe, beforeAll, beforeEach } from "bun:test";
import { startTestApp } from "../../tests/setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";

describe("Test acknowledge disaster notifications", () => {
    let app: Hono;
    let backup: IBackup;
    let seedUserId1: string;
    let seedUserId2: string;
    let seedDisasterId1: string;
    let seedDisasterId2: string;
    let disasterNotificationId: string;
    let disasterNotificationId2: string;

    const seedUsers = [
        {
            id: randomUUID(),
            firstName: "Alice",
            lastName: "Bob",
            email: "alice@prisere.com",
        },
        {
            id: randomUUID(),
            firstName: "Bob",
            lastName: "Alice",
            email: "bob@prisere.com",
        },
    ];

    const seedDisasters = [
        {
            id: randomUUID(),
            disasterNumber: 1011,
            fipsStateCode: "23",
            declarationDate: "2025-09-28T00:00:00.000Z",
            incidentBeginDate: "2025-09-29T00:00:00.000Z",
            incidentEndDate: "2025-10-05T00:00:00.000Z",
            incidentType: "bad",
            fipsCountyCode: "999",
            declarationType: "11",
            designatedArea: "County A",
            designatedIncidentTypes: "1",
        },
        {
            id: randomUUID(),
            disasterNumber: 1012,
            fipsStateCode: "24",
            declarationDate: "2025-09-28T00:00:00.000Z",
            incidentBeginDate: "2025-09-29T00:00:00.000Z",
            incidentEndDate: "2025-10-05T00:00:00.000Z",
            incidentType: "worse",
            fipsCountyCode: "888",
            declarationType: "12",
            designatedArea: "County B",
            designatedIncidentTypes: "2",
        },
    ];

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;

        // Create seed data once
        for (const user of seedUsers) {
            await app.request("/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
        }

        for (const disaster of seedDisasters) {
            await app.request("/disaster", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(disaster),
            });
        }

        seedUserId1 = seedUsers[0].id;
        seedUserId2 = seedUsers[1].id;
        seedDisasterId1 = seedDisasters[0].id;
        seedDisasterId2 = seedDisasters[1].id;
    });

    beforeEach(async () => {
        backup.restore();

        // Only create notifications in beforeEach
        const requestBody = [
            {
                userId: seedUserId1,
                femaDisasterId: seedDisasterId1,
                notificationType: "web",
            },
            {
                userId: seedUserId2,
                femaDisasterId: seedDisasterId2,
                notificationType: "email",
            },
        ];

        const response = await app.request(`/disasterNotification/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const body = await response.json();
        disasterNotificationId = body[0].id;
        disasterNotificationId2 = body[1].id;
        console.log(disasterNotificationId);
        console.log(disasterNotificationId2);
    });
});
