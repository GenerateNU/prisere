import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { initTestData } from "./setup";
import { DataSource } from "typeorm";
import { beforeEach } from "node:test";
import { ClaimStatusType } from "../../types/ClaimStatusType";
import femaDisasterFactory from "../../database/factories/femaDisaster.factory";
import { FemaDisaster } from "../../entities/FemaDisaster";

describe("POST /claims", () => {
    let app: Hono;
    let backup: IBackup;
    let testAppDataSource: DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        testAppDataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        await initTestData(testAppDataSource);
    });

    afterEach(async () => {
        backup.restore();
    });

    test("POST /claims - Success", async () => {
        const requestBody = {
            femaDisasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
            companyId: "c0ce685a-27d8-4183-90ff-31f294b2c6da",
        };

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(201);
        const body = await response.json();
        expect(body.femaDisasterId).toBe("2aa52e71-5f89-4efe-a820-1bfc65ded6ec");
        expect(body.companyId).toBe(requestBody.companyId);
        expect(body.status).toBe(ClaimStatusType.ACTIVE);
        expect(body.createdAt).toBeDefined();
        expect(body.updatedAt).toBeDefined();

        const fetchResponse = await app.request(`/claims/company/${requestBody.companyId}`);
        const fetchBody = await fetchResponse.json();

        expect(fetchResponse.status).toBe(200);
        console.log(fetchBody, "HEY");
        expect(fetchBody.length).toBe(2);
        expect(fetchBody[1].id).toBe(body.id);
        expect(fetchBody[1].femaDisaster.id).toBe(requestBody.femaDisasterId);
        expect(fetchBody[1].companyId).toBe(requestBody.companyId);
    });

    test("POST /claims - Company with multiple claims", async () => {
        const requestBody2 = {
            femaDisasterId: "47f0c515-2efc-49c3-abb8-623f48817950",
            companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
        };

        const response2 = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody2),
        });

        expect(response2.status).toBe(201);
        const body2 = await response2.json();
        expect(body2.femaDisasterId).toBe(requestBody2.femaDisasterId);
        expect(body2.companyId).toBe(requestBody2.companyId);
        expect(body2.status).toBe(ClaimStatusType.ACTIVE);
        expect(body2.createdAt).toBeDefined();
        expect(body2.updatedAt).toBeDefined();
    });

    test("POST /claims - CompanyID doesnt exist", async () => {
        const requestBody = {
            companyId: "c290f1ee-6c54-4b01-90e6-d701748f0851",
            femaDisasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
        };

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(500);
    });

    test("POST /claims - DisasterID doesnt exist", async () => {
        const requestBody = {
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            femaDisasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6e2",
        };

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(500);
    });

    test("POST /claims - Missing Fields", async () => {
        const requestBody = {
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
        };

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims - Empty Fields", async () => {
        const requestBody = {
            disasterId: "",
            companyId: "",
        };

        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        expect(response.status).toBe(400);
    });

    test("POST /claims - Empty Request Body", async () => {
        const response = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });

        expect(response.status).toBe(400);
    });
});
