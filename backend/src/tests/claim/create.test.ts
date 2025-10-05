import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("POST /claims", () => {
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

    test("POST /claims - Success", async () => {
        const requestBody = {
            disasterId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
            companyId: "c290f1ee-6c54-4b01-90e6-d701748f0851"
        }

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.disasterId).toBe(requestBody.disasterId);
        expect(body.companyId).toBe(requestBody.companyId);
        expect(body.status).toBe("CREATED");
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBe(null);
    })

    test("POST /claims - Missing Fields", async () => {
        const requestBody = {
            companyId: "c290f1ee-6c54-4b01-90e6-d701748f0851",
        }

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    })

    test("POST /claims - Empty Fields", async () => {
        const requestBody = {
            disasterId: "",
            companyId: ""
        }

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    })

    test("POST /claims - Empty Request Body", async () => {
        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    })
})