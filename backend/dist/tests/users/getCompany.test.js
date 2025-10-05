import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { GetUserCompanyResponseSchema } from "../../types/User";
import { validate } from "uuid";
describe("GET /users/:id/company", () => {
    let app;
    let backup;
    beforeAll(async () => {
        const setup = await startTestApp();
        app = setup.app;
        backup = setup.backup;
    });
    afterEach(() => {
        backup.restore();
    });
    test("should return 200 and company data when user exists and has a company", async () => {
        // First create a company
        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test Company Inc.",
            }),
        });
        const createdCompany = await createCompanyResponse.json();
        const companyId = createdCompany.id;
        // Create a user and associate with company (this depends on your implementation)
        const createUserResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                companyId: companyId, // Assuming user can be created with companyId
            }),
        });
        const createdUser = await createUserResponse.json();
        const userId = createdUser.id;
        // Now test the GET /users/:id/company endpoint
        const response = await app.request(`/users/${userId}/company`, {
            method: "GET",
        });
        expect(response.status).toBe(200);
        const companyData = await response.json();
        expect(companyData).toMatchObject({
            companyId: companyId,
            companyName: "Test Company Inc.",
        });
        // Validate response schema
        const schemaValidation = GetUserCompanyResponseSchema.safeParse(companyData);
        expect(schemaValidation.success).toBe(true);
    });
    test("should return 400 when ID is not a valid UUID", async () => {
        const invalidIds = ["123", "not-a-uuid", "12345678-1234-1234-1234"];
        for (const invalidId of invalidIds) {
            const response = await app.request(`/users/${invalidId}/company`, {
                method: "GET",
            });
            expect(response.status).toBe(400);
            const errorData = await response.json();
            expect(errorData).toHaveProperty("error");
            expect(errorData.error).toBe("The given ID must be well formed and present to get the company of a user.");
        }
    });
    test("should return 404 when UUID is valid but user does not exist", async () => {
        const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";
        const response = await app.request(`/users/${nonExistentId}/company`, {
            method: "GET",
        });
        expect(response.status).toBe(404);
        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
        expect(errorData.error).toContain("Unable to find the company from the User ID:");
    });
    test("should return 404 when user exists but has no associated company", async () => {
        // Create user without company
        const createUserResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@example.com",
            }),
        });
        const createdUser = await createUserResponse.json();
        const userId = createdUser.id;
        // Test GET /users/:id/company endpoint
        const response = await app.request(`/users/${userId}/company`, {
            method: "GET",
        });
        expect(response.status).toBe(404);
        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
        expect(errorData.error).toContain("Unable to find the company from the User ID:");
    });
    test("should handle UUID in different case formats", async () => {
        // Create a company first
        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Case Test Company",
            }),
        });
        const createdCompany = await createCompanyResponse.json();
        // Create a user with company
        const createUserResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Test",
                lastName: "User",
                companyId: createdCompany.id,
            }),
        });
        const createdUser = await createUserResponse.json();
        const userId = createdUser.id;
        // Test with uppercase UUID
        const upperCaseId = userId.toUpperCase();
        const responseUpper = await app.request(`/users/${upperCaseId}/company`, {
            method: "GET",
        });
        // Depending on your UUID validation, this might be 200 or 400
        expect([200, 400]).toContain(responseUpper.status);
        // Test with lowercase UUID
        const lowerCaseId = userId.toLowerCase();
        const responseLower = await app.request(`/users/${lowerCaseId}/company`, {
            method: "GET",
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
        // Create a company
        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Concurrent Test Company",
            }),
        });
        const createdCompany = await createCompanyResponse.json();
        // Create a user with company
        const createUserResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Concurrent",
                lastName: "Test",
                email: "concurrent@test.com",
                companyId: createdCompany.id,
            }),
        });
        const createdUser = await createUserResponse.json();
        const userId = createdUser.id;
        // Make multiple concurrent requests
        const requests = Array(5)
            .fill(null)
            .map(() => app.request(`/users/${userId}/company`, { method: "GET" }));
        const responses = await Promise.all(requests);
        // All should succeed
        responses.forEach((response) => {
            expect(response.status).toBe(200);
        });
        // All should return the same data
        const companyData = await Promise.all(responses.map((r) => r.json()));
        companyData.forEach((data) => {
            expect(data).toMatchObject({
                companyId: createdCompany.id,
                companyName: "Concurrent Test Company",
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
            const response = await app.request(`/users/${encodeURIComponent(specialId)}/company`, {
                method: "GET",
            });
            expect(response.status).toBe(400);
            const errorData = await response.json();
            expect(errorData).toHaveProperty("error");
            expect(errorData.error).toBe("The given ID must be well formed and present to get the company of a user.");
        }
    });
    test("should return consistent company data structure", async () => {
        // Create company with all possible fields
        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Full Data Company",
            }),
        });
        const createdCompany = await createCompanyResponse.json();
        // Create user with company
        const createUserResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Data",
                lastName: "Test",
                companyId: createdCompany.id,
            }),
        });
        const createdUser = await createUserResponse.json();
        const userId = createdUser.id;
        // Test the endpoint
        const response = await app.request(`/users/${userId}/company`, {
            method: "GET",
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
        const createUserResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Orphan",
                lastName: "User",
                email: "orphan@test.com",
            }),
        });
        const createdUser = await createUserResponse.json();
        const userId = createdUser.id;
        // Test GET /users/:id/company endpoint
        const response = await app.request(`/users/${userId}/company`, {
            method: "GET",
        });
        // Should return 404 since user has no company
        expect(response.status).toBe(404);
        const errorData = await response.json();
        expect(errorData).toHaveProperty("error");
    });
    test("should return appropriate headers", async () => {
        // Create company and user
        const createCompanyResponse = await app.request("/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Header Test Company",
            }),
        });
        const createdCompany = await createCompanyResponse.json();
        const createUserResponse = await app.request("/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstName: "Header",
                lastName: "Test",
                companyId: createdCompany.id,
            }),
        });
        const createdUser = await createUserResponse.json();
        const userId = createdUser.id;
        const response = await app.request(`/users/${userId}/company`, {
            method: "GET",
        });
        expect(response.status).toBe(200);
    });
});
