import { Hono } from "hono";
import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";

describe("DELETE /claims/:id", () => {
    let app: Hono;
    let backup: IBackup;
    let claimId1: string;
    let claimId2: string;
    let claimId3: string;
    let companyId: string;
    let companyId2: string;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;

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
        companyId = companyResult.id;

        const companyResult2 = await companyResponse2.json();
        companyId2 = companyResult2.id;

        // add claims
        const claim = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
                companyId: companyId
            }),
        });

        const claimResult = await claim.json();
        claimId1 = claimResult.id;


        const claim2 = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-hufe-90e6-d701748f0851",
                companyId: companyId
            }),
        });
        const claimResult2 = await claim2.json();
        claimId2 = claimResult2.id;

        const claim3 = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-owhew-d701748f0851",
                companyId: companyId2
            }),
        });
        const claimResult3 = await claim3.json();
        claimId3 = claimResult3.id;
    });

    afterEach(async () => {
        backup.restore();
    });

    test("DELETE /claims - Successful Delete", async () => {
        const response = await app.request(`/claims/${claimId1}`, {
            method: "DELETE",
        });

        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.id).toBe(claimId1);

        const claims = await app.request("/claims", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                disasterId: "d290f1ee-6c54-4b01-owhew-d701748f0851",
                companyId: companyId
            }),
        });

        const claimsbody = await claims.json();
        expect(claimsbody.length).toBe(1);
    })

    test("DELETE /claims - Deleting a claim that doesnt exist", async () => {
        const response = await app.request(`/claims/${"doesntexist"}`, {
            method: "DELETE",
        });

        const body = await response.json();
        expect(response.status).toBe(400);
    })
})