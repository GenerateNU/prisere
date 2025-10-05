import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("GET /claims/company/:id", () => {
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

    test("GET - Successfully Gets related claims (multiple)", async () => {
        // add a company
        const companyResponse = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "Cool Company",
            }),
        });

        const companyResponse2 = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "Cool Company",
            }),
        });

        const companyResult = await companyResponse.json();
        const companyId = companyResult.id;

        const companyResult2 = await companyResponse2.json();
        const companyId2 = companyResult2.id;

        // add claims
        await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
                companyId: companyId
            }),
        });

        await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-hufe-90e6-d701748f0851",
                companyId: companyId
            }),
        });

        await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-owhew-d701748f0851",
                companyId: companyId2
            }),
        });

        const response = await app.request(`/claims/company/${companyId}`);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.length).toBe(2);
        expect(body[0].companyId).toBe(companyId);
        expect(body[1].companyId).toBe(companyId);

    })

    test("GET - Successfully Gets related claims (single claim)", async () => {
        // add a company
        const companyResponse = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "Cool Company",
            }),
        });

        const companyResponse2 = await app.request("/companies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: "Cool Company",
            }),
        });

        const companyResult = await companyResponse.json();
        const companyId = companyResult.id;

        const companyResult2 = await companyResponse2.json();
        const companyId2 = companyResult2.id;

        // add claim

        await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-hufe-90e6-d701748f0851",
                companyId: companyId
            }),
        });

        await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-owhew-d701748f0851",
                companyId: companyId2
            }),
        });

        const response = await app.request(`/claims/company/${companyId}`);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.length).toBe(1);
        expect(body[0].companyId).toBe(companyId);

    })

    test("GET - No related claims for companyId", async () => {

        // add claims
        await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
                companyId: "cdi0f1ee-6c54-9h87-90e6-2fei25f0851"
            }),
        });

        await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-owhew-d701748f0851",
                companyId: "123"
            }),
        });

        const response = await app.request("/claims/company/d290f1ee-6c54-hufe-90e6-d701748f0851");
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.length).toBe(0);

    })




})