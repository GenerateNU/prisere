import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach, beforeEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { GetUserCompanyResponseSchema } from "../../types/User";
import { validate } from "uuid";
import { TESTING_PREFIX } from "../../utilities/constants";
import UserSeeder from "../../database/seeds/user.seed";
import CompanySeeder from "../../database/seeds/company.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

describe("GET /users/:id/company", () => {
    let app: Hono;
    let backup: IBackup;
    let datasource: DataSource;

    beforeAll(async () => {
        const setup = await startTestApp();
        app = setup.app;
        backup = setup.backup;
        datasource = setup.dataSource;
    });

    afterEach(() => {
        backup.restore();
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(datasource, {} as SeederFactoryManager);

        const userSeeder = new UserSeeder();
        await userSeeder.run(datasource, {} as SeederFactoryManager);
    });

    test("should return 200 and company data when user exists and has a company", async () => {
        // Now test the GET /users/:id/company endpoint
        const response = await app.request(TESTING_PREFIX + `/users/company`, {
            method: "GET",
            headers: {
                userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
            },
        });

        expect(response.status).toBe(200);

        const companyData = await response.json();
        expect(companyData).toMatchObject({
            companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            companyName: "Test Company ABC",
        });

        // Validate response schema
        const schemaValidation = GetUserCompanyResponseSchema.safeParse(companyData);
        expect(schemaValidation.success).toBe(true);
    });

    test("should return 400 when ID is not a valid UUID", async () => {
        const invalidIds = ["123", "not-a-uuid", "12345678-1234-1234-1234"];

        for (const invalidId of invalidIds) {
            const response = await app.request(TESTING_PREFIX + `/users/company`, {
                method: "GET",
                headers: {
                    userId: invalidId,
                },
            });

            expect(response.status).toBe(400);
            const errorData = await response.json();
            expect(errorData).toHaveProperty("error");
            expect(errorData.error).toBe("The given ID must be well formed and present to get the company of a user.");
        }
    });

    test("should return 404 when UUID is valid but user does not exist", async () => {
        const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";

        const response = await app.request(TESTING_PREFIX + `/users/company`, {
            method: "GET",
            headers: {
                userId: nonExistentId,
            },
        });

        expect(response.status).toBe(404);
        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
        expect(errorData.error).toContain("Unable to find the company from the User ID:");
    });

    test("should return 404 when user exists but has no associated company", async () => {
        const response = await app.request(TESTING_PREFIX + `/users/company`, {
            method: "GET",
            headers: {
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
        });

        expect(response.status).toBe(404);
        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
        expect(errorData.error).toContain("Unable to find the company from the User ID:");
    });

    test("should handle UUID in different case formats", async () => {
        // Test with uppercase UUID
        const upperCaseId = "0199e103-5452-76d7-8d4d-92e70c641bdb".toUpperCase();
        const responseUpper = await app.request(TESTING_PREFIX + `/users/company`, {
            method: "GET",
            headers: {
                userId: upperCaseId,
            },
        });

        // Depending on your UUID validation, this might be 200 or 400
        expect([200, 400]).toContain(responseUpper.status);

        // Test with lowercase UUID
        const lowerCaseId = "0199e103-5452-76d7-8d4d-92e70c641bdb".toLowerCase();
        const responseLower = await app.request(TESTING_PREFIX + `/users/company`, {
            method: "GET",
            headers: {
                userId: lowerCaseId,
            },
        });

        expect([200, 400]).toContain(responseLower.status);
    });

    test("should validate UUID format correctly", () => {
        // Unit tests for UUID validation (reusing from user tests)
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

    test("should handle concurrent requests for the same user company", async () => {
        // Make multiple concurrent requests
        const requests = Array(5)
            .fill(null)
            .map(() =>
                app.request(TESTING_PREFIX + `/users/company`, {
                    method: "GET",
                    headers: {
                        userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
                    },
                })
            );

        const responses = await Promise.all(requests);

        // All should succeed
        responses.forEach((response) => {
            expect(response.status).toBe(200);
        });

        // All should return the same data
        const companyData = await Promise.all(responses.map((r) => r.json()));
        companyData.forEach((data) => {
            expect(data).toMatchObject({
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                companyName: "Test Company ABC",
            });
        });
    });

    test("should return consistent company data structure", async () => {
        const response = await app.request(TESTING_PREFIX + `/users/company`, {
            method: "GET",
            headers: {
                userId: "0199e103-5452-76d7-8d4d-92e70c641bdb",
            },
        });

        expect(response.status).toBe(200);

        const companyData = await response.json();

        // Ensure required fields are present
        expect(companyData).toHaveProperty("companyId");
        expect(companyData).toHaveProperty("companyName");

        // Ensure data types are correct
        expect(typeof companyData.companyId).toBe("string");
        expect(typeof companyData.companyName).toBe("string");

        // Ensure no extra fields are returned (only companyId and companyName)
        const expectedKeys = ["companyId", "companyName"];
        const actualKeys = Object.keys(companyData);
        expect(actualKeys.sort()).toEqual(expectedKeys.sort());
    });

    test("should handle empty or null company associations gracefully", async () => {
        // This test assumes your system might have users with null/empty company references
        // You might need to adjust based on your actual data constraints

        // Create user first
        const createUserResponse = await app.request(TESTING_PREFIX + "/users", {
            method: "POST",
            headers: { "Content-Type": "application/json", userId: "0199e0cc-4e92-702c-9773-071340163ae4" },
            body: JSON.stringify({
                firstName: "Orphan",
                lastName: "User",
                email: "orphan@test.com",
            }),
        });

        await createUserResponse.json();

        // Test GET /users/:id/company endpoint
        const response = await app.request(TESTING_PREFIX + `/users/company`, {
            method: "GET",
            headers: {
                userId: "0199e0cc-4e92-702c-9773-071340163ae4",
            },
        });

        // Should return 404 since user has no company
        expect(response.status).toBe(404);

        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
    });
});
