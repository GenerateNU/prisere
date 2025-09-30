import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { CreateUserResponseSchema } from "../../types/user";
import { validate } from "uuid";

const resetZahra = () => ({
    firstName: "Zahra",
    lastName: "Wibisana",
    email: "zahra.w@gmail.com",
    comapnyId: null,
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
        const response = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const responseData = await response.json();
        const validatedResponse = CreateUserResponseSchema.parse(responseData);
        expect(validatedResponse).toMatchObject({
            firstName: requestBody.firstName,
            lastName: requestBody.lastName,
            email: requestBody.email,
            companyId: null,
        });
        expect(validate(validatedResponse.id)).toBe(true);
    });

    test("test that emails are optinal when creating a user", async () => {
        requestBody.email = undefined as unknown as string;
        const response = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
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

    test("test that company ID is saved", async () => {
        const companyResponse = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: "Josh & Co." }),
        });

        const newCompanyId = (await companyResponse.json()).id;
        (requestBody as unknown as { companyId: string }).companyId = newCompanyId;

        const userResponse = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        expect(userResponse.status).toBe(201);
        const responseData = await userResponse.json();

        expect(responseData).toMatchObject({
            firstName: requestBody.firstName,
            lastName: requestBody.lastName,
            email: null,
            companyId: newCompanyId,
        });
        expect(validate(responseData.id)).toBe(true);
    });

    test("test that first names are not optional when creating a user", async () => {
        requestBody.firstName = undefined as unknown as string;
        requestBody.email = undefined as unknown as string;
        const response = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(400);
    });

    test("test that last names are not optional when creating a user", async () => {
        requestBody.lastName = undefined as unknown as string;
        const response = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
        expect(response.status).toBe(400);
    });

    test("Test that an empty object fails when creating a user", async () => {
        const response = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });

    test("Test that an empty first name fails when creating a user", async () => {
        requestBody.firstName = "";
        const response = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });
    test("Test that an empty last name fails when creating a user", async () => {
        requestBody.lastName = "";
        const response = await app.request("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
        expect(response.status).toBe(400);
    });
});
