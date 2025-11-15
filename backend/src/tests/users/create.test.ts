import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { validate } from "uuid";
import { CreateUpdateUserResponseSchema } from "../../types/User";
import { TESTING_PREFIX } from "../../utilities/constants";
import { startTestApp } from "../setup-tests";

const resetZahra = () => ({
    firstName: "Zahra",
    lastName: "Wibisana",
    email: "zahra.w@gmail.com",
    companyId: null,
    phoneNumber: "1111111111",
});

describe("POST users/", () => {
    let app: Hono;
    let backup: IBackup;
    const requestBody = resetZahra();

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("The default case creates a new user", async () => {
        const response = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const responseData = await response.json();
        const validatedResponse = CreateUpdateUserResponseSchema.parse(responseData);
        expect(validatedResponse).toMatchObject({
            firstName: requestBody.firstName,
            lastName: requestBody.lastName,
            email: requestBody.email,
            companyId: null,
        });
        expect(validate(validatedResponse.id)).toBe(true);
    });

    test("test that emails are optional when creating a user", async () => {
        requestBody.email = undefined as unknown as string;
        const response = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(201);
        const responseData = await response.json();

        expect(responseData).toMatchObject({
            firstName: requestBody.firstName,
            lastName: requestBody.lastName,
            email: null,
        });
        expect(validate(responseData.id)).toBe(true);
    });

    test("test that first names are not optional when creating a user", async () => {
        requestBody.firstName = undefined as unknown as string;
        requestBody.email = undefined as unknown as string;
        const response = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(400);
    });

    test("test that last names are not optional when creating a user", async () => {
        requestBody.lastName = undefined as unknown as string;
        const response = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(400);
    });

    test("Test that an empty object fails when creating a user", async () => {
        const response = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });

    test("Test that an empty first name fails when creating a user", async () => {
        requestBody.firstName = "";
        const response = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });
    test("Test that an empty last name fails when creating a user", async () => {
        requestBody.lastName = "";
        const response = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                userId: "3c191e85-7f80-40a6-89ec-cbdbff33a5b2",
            },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });
});
