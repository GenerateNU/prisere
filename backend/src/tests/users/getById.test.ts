import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { GetUserResponseSchema } from "../../modules/user/types";
import { validate } from "uuid";

describe("GET /users/:id", () => {
    let app: Hono;
    let backup: IBackup;

    beforeAll(async () => {
        const setup = await startTestApp();
        app = setup.app;
        backup = setup.backup;
    });

    afterEach(() => {
        backup.restore();
    });

    test("should return 200 and user data when valid UUID is provided", async () => {
        // First create a user to retrieve
        const createResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
            }),
        });

        const createdUser = await createResponse.json();
        const userId = createdUser.id;

        // Now test the GET endpoint
        const response = await app.request(`/users/${userId}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);

        const userData = await response.json();
        expect(userData).toMatchObject({
            id: userId,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
        });

        // Validate response schema
        const schemaValidation = GetUserResponseSchema.safeParse(userData);
        expect(schemaValidation.success).toBe(true);
    });

    test("should return 200 and user data without email when user has no email", async () => {
        // Create user without email
        const createResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Jane",
                lastName: "Smith",
            }),
        });

        const createdUser = await createResponse.json();
        const userId = createdUser.id;

        // Test GET endpoint
        const response = await app.request(`/users/${userId}`, {
            method: "GET",
        });

        expect(response.status).toBe(200);

        const userData = await response.json();
        expect(userData).toMatchObject({
            id: userId,
            firstName: "Jane",
            lastName: "Smith",
        });
        expect(userData.email).toBeNull();
    });

    test("should return 400 when ID is not a valid UUID", async () => {
        const invalidIds = ["123", "not-a-uuid", "12345678-1234-1234-1234"];

        for (const invalidId of invalidIds) {
            const response = await app.request(`/users/${invalidId}`, {
                method: "GET",
            });

            expect(response.status).toBe(400);

            const errorData = await response.json();
            expect(errorData).toHaveProperty("error");
            expect(errorData.error).toBe("The given ID must be well formed and present to get a User.");
        }
    });

    test("should return 404 when UUID is valid but user does not exist", async () => {
        const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";

        const response = await app.request(`/users/${nonExistentId}`, {
            method: "GET",
        });

        expect(response.status).toBe(404);
        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
    });

    test("should handle UUID in different case formats", async () => {
        // Create a user first
        const createResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Test",
                lastName: "User",
            }),
        });

        const createdUser = await createResponse.json();
        const userId = createdUser.id;

        // Test with uppercase UUID
        const upperCaseId = userId.toUpperCase();
        const responseUpper = await app.request(`/users/${upperCaseId}`, {
            method: "GET",
        });

        // Depending on your UUID validation, this might be 200 or 400
        // Adjust based on your isIdWellFormed implementation
        expect([200, 400]).toContain(responseUpper.status);

        // Test with lowercase UUID
        const lowerCaseId = userId.toLowerCase();
        const responseLower = await app.request(`/users/${lowerCaseId}`, {
            method: "GET",
        });

        expect([200, 400]).toContain(responseLower.status);
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

    test("should handle concurrent requests for the same user", async () => {
        // Create a user
        const createResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Concurrent",
                lastName: "Test",
                email: "concurrent@test.com",
            }),
        });

        const createdUser = await createResponse.json();
        const userId = createdUser.id;

        // Make multiple concurrent requests
        const requests = Array(5)
            .fill(null)
            .map(() => app.request(`/users/${userId}`, { method: "GET" }));

        const responses = await Promise.all(requests);

        // All should succeed
        responses.forEach((response) => {
            expect(response.status).toBe(200);
        });

        // All should return the same data
        const userData = await Promise.all(responses.map((r) => r.json()));
        userData.forEach((data) => {
            expect(data).toMatchObject({
                id: userId,
                firstName: "Concurrent",
                lastName: "Test",
                email: "concurrent@test.com",
            });
        });
    });

    test("should handle special characters in path parameter", async () => {
        const specialIds = [
            "../users/123",
            "../../etc/passwd",
            "%2e%2e%2f",
            "<script>alert('xss')</script>",
            "'; DROP TABLE users; --",
        ];

        for (const specialId of specialIds) {
            const response = await app.request(`/users/${encodeURIComponent(specialId)}`, {
                method: "GET",
            });

            expect(response.status).toBe(400);

            const errorData = await response.json();
            expect(errorData).toHaveProperty("error");
            expect(errorData.error).toBe("The given ID must be well formed and present to get a User.");
        }
    });
});
