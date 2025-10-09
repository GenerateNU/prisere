import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import { createUser } from "../utils";
import { DataSource } from "typeorm";
import { UserPreferences } from "../../entities/UserPreferences";
import { UpdateUesrNotificationPreferencesDTO } from "../../types/Preferences";

describe("notification preference retreival", () => {
    let app: Hono;
    let backup: IBackup;
    let db: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        db = testAppData.dataSource;
    });

    afterEach(async () => {
        backup.restore();
    });

    it("should create a user's preferences on user creation", async () => {
        const { data: user } = await createUser(app, { firstName: "test", lastName: "user" });
        const response = await app.request(`/notifications/preferences/${user.id}`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            emailEnabled: true,
            webNotificationsEnabled: true,
            notificationFrequency: "daily",
        });
    });

    it("should get a user's notifications that do not exist yet", async () => {
        const { data: user } = await createUser(app, { firstName: "test", lastName: "user" });

        // delete user preferences from the database (simulates user that was created before preferences existed)
        await db.getRepository(UserPreferences).delete({ userId: user.id });

        const response = await app.request(`/notifications/preferences/${user.id}`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            emailEnabled: true,
            webNotificationsEnabled: true,
            notificationFrequency: "daily",
        });
    });
});

describe("notification preference update", () => {
    let app: Hono;
    let backup: IBackup;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    afterEach(async () => {
        backup.restore();
    });

    it("should perform full update to user preferences", async () => {
        const { data: user } = await createUser(app, { firstName: "test", lastName: "user" });
        const getResponse = await app.request(`/notifications/preferences/${user.id}`);

        expect(getResponse.status).toBe(200);
        expect(await getResponse.json()).toEqual({
            emailEnabled: true,
            webNotificationsEnabled: true,
            notificationFrequency: "daily",
        });

        const updateResponse = await app.request(`/notifications/preferences/${user.id}`, {
            method: "PUT",
            body: JSON.stringify({
                emailEnabled: false,
                webNotificationsEnabled: false,
                notificationFrequency: "weekly",
            } satisfies UpdateUesrNotificationPreferencesDTO),
        });

        expect(updateResponse.status).toBe(201);
        expect(await updateResponse.json()).toEqual({
            emailEnabled: false,
            webNotificationsEnabled: false,
            notificationFrequency: "weekly",
        });
    });

    it("should perform partial update to user preferences", async () => {
        const { data: user } = await createUser(app, { firstName: "test", lastName: "user" });
        const getResponse = await app.request(`/notifications/preferences/${user.id}`);

        expect(getResponse.status).toBe(200);
        expect(await getResponse.json()).toEqual({
            emailEnabled: true,
            webNotificationsEnabled: true,
            notificationFrequency: "daily",
        });

        const updateResponse = await app.request(`/notifications/preferences/${user.id}`, {
            method: "PUT",
            body: JSON.stringify({
                emailEnabled: false,
                notificationFrequency: "weekly",
            } satisfies UpdateUesrNotificationPreferencesDTO),
        });

        expect(updateResponse.status).toBe(201);
        expect(await updateResponse.json()).toEqual({
            emailEnabled: false,
            webNotificationsEnabled: true,
            notificationFrequency: "weekly",
        });
    });

    it("should error on no values given", async () => {
        const { data: user } = await createUser(app, { firstName: "test", lastName: "user" });
        const getResponse = await app.request(`/notifications/preferences/${user.id}`);

        expect(getResponse.status).toBe(200);
        expect(await getResponse.json()).toEqual({
            emailEnabled: true,
            webNotificationsEnabled: true,
            notificationFrequency: "daily",
        });

        const updateResponse = await app.request(`/notifications/preferences/${user.id}`, {
            method: "PUT",
            body: JSON.stringify({} satisfies UpdateUesrNotificationPreferencesDTO),
        });

        expect(updateResponse.status).toBe(400);
        expect(await updateResponse.json()).toEqual({ error: "Must contain values to update" });
    });
});
