import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { GetUserResponseSchema } from "../../types/User";
import { validate } from "uuid";
import { TESTING_PREFIX } from "../../utilities/constants";
import { beforeEach } from "node:test";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import UserSeeder from "../../database/seeds/user.seed";
import CompanySeeder from "../../database/seeds/company.seed";
describe("GET /users/:id", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;

    beforeAll(async () => {
        const setup = await startTestApp();
        app = setup.app;
        backup = setup.backup;
        datasource = setup.dataSource;
    });

    beforeEach(async() => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

        const userSeeder = new UserSeeder();
        await userSeeder.run(datasource, {} as SeederFactoryManager);
    })

    afterEach(() => {
        backup.restore();
    });

    test("should return 200 and user data when valid UUID is provided", async () => {
        // Now test the GET endpoint
        const response = await app.request(TESTING_PREFIX + `/users`, {
            method: "GET",
            headers: {
                "userId": "0199e0cc-4e92-702c-9773-071340163ae4",
            },
        });

        expect(response.status).toBe(200);

        const userData = await response.json();
        expect(userData).toMatchObject({
            id: "0199e0cc-4e92-702c-9773-071340163ae4",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
        });

        // Validate response schema
        const schemaValidation = GetUserResponseSchema.safeParse(userData);
        expect(schemaValidation.success).toBe(true);
    });

    test("should return 200 and user data without email when user has no email", async () => {
        const response = await app.request(TESTING_PREFIX + `/users`, {
            headers: {
                "userId": "0199e0cc-4e92-702c-9773-071340163ae4",
            },
            method: "GET",
        });

        expect(response.status).toBe(200);

        const userData = await response.json();
        expect(userData).toMatchObject({
            id: "0199e0cc-4e92-702c-9773-071340163ae4",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com"
        });
    });

    test("should return 400 when ID is not a valid UUID", async () => {
        const invalidIds = ["123", "not-a-uuid", "12345678-1234-1234-1234"];

        for (const invalidId of invalidIds) {
            const response = await app.request(TESTING_PREFIX + `/users`, {
                method: "GET",
                headers: {
                    "userId": invalidId,
                },
            });

            expect(response.status).toBe(400);

            const errorData = await response.json();
            expect(errorData).toHaveProperty("error");
            expect(errorData.error).toBe("The given ID must be well formed and present to get a User.");
        }
    });

    test("should return 404 when UUID is valid but user does not exist", async () => {
        const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";

        const response = await app.request(TESTING_PREFIX + `/users`, {
            method: "GET",
            headers: {
                "userId": nonExistentId,
            },
        });

        expect(response.status).toBe(404);
        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
    });

    test("should validate UUID format correctly", () => {
        // Unit tests for UUID validation
        const validUUIDs = [
            "550e8400-e29b-41d4-a716-446655440000",
            "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
            "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
            "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
        ];

        const invalidUUIDs = [
            "not-a-uuid",
            "123456789",
            "550e8400-e29b-41d4-a716",
            "550e8400-e29b-41d4-a716-446655440000-extra",
            "g50e8400-e29b-41d4-a716-446655440000",
            "",
        ];

        // Test valid UUIDs
        validUUIDs.forEach((uuid) => {
            expect(validate(uuid)).toBe(true);
        });

        // Test invalid UUIDs
        invalidUUIDs.forEach((uuid) => {
            expect(validate(uuid)).toBe(false);
        });
    });
});
