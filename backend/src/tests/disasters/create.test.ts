import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import { CreateDisasterResponse, CreateDisasterDTO, GetAllDisastersResponseSchema } from "../../types/disaster";
import { randomUUIDv7 } from "bun";

describe("Create disasters", () => {
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

    it("should create a disaster", async () => {
        const now = new Date().toISOString();
        const constructedObject = {
            femaId: randomUUIDv7(),
            state: 25,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 1000,
            startDate: now,
            endDate: now,
        } satisfies CreateDisasterDTO;

        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(constructedObject),
        });
        expect(response.status).toBe(201);
        const responseBody = await response.json();

        const responseKeys = [
            "declarationDate",
            "declarationType",
            "designatedIncidentTypes",
            "femaId",
            "state",
        ] as (keyof Exclude<CreateDisasterResponse, { error: string }>)[];

        for (const key of responseKeys) {
            expect(responseBody[key]).toBe(constructedObject[key]);
        }
    });

    it("should not accept an invalid state number", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                femaId: randomUUIDv7(),
                state: 100, // over the 56 limit
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "Z",
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 1000,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
            } satisfies CreateDisasterDTO),
        });
        expect(response.status).toBe(400);
        expect((await response.json()).error).toContain("expected number to be <=56");
    });

    it("should not accept an invalid county number", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                femaId: randomUUIDv7(),
                state: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "Z",
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 9999999, // over the 56045 limit
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
            } satisfies CreateDisasterDTO),
        });
        expect(response.status).toBe(400);
        expect((await response.json()).error).toContain("expected number to be <=56045");
    });

    it("should not accept an invalid set of incident codes", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                femaId: randomUUIDv7(),
                state: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "9,Z,W", // 9 is not valid
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 1000,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
            } satisfies CreateDisasterDTO),
        });
        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("Invalid input");
        expect(responseBody.error).toContain("at designatedIncidentTypes");
    });

    it("should not accept an malformatted incident code set", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                femaId: randomUUIDv7(),
                state: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "ZW", // Z and W should be separated by `,`
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 1000,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
            } satisfies CreateDisasterDTO),
        });
        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("Invalid input");
        expect(responseBody.error).toContain("at designatedIncidentTypes");
    });

    it("should not accept an malformatted incident code set", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                femaId: randomUUIDv7(),
                state: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "ZW", // Z and W should be separated by `,`
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 1000,
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
            } satisfies CreateDisasterDTO),
        });
        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("Invalid input");
        expect(responseBody.error).toContain("at designatedIncidentTypes");
    });

    it("should not accept a start date after an end date", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                femaId: randomUUIDv7(),
                state: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "Z",
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 1000,
                startDate: new Date("03/25/2025").toISOString(),
                endDate: new Date("03/20/2025").toISOString(),
            } satisfies CreateDisasterDTO),
        });
        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("Start date must be after or equal to end date");
    });
});

describe("Create disasters", () => {
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

    it("should return empty array when no disasters in db", async () => {
        const response = await app.request("/disaster", {
            method: "GET",
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBe(0);
    });

    it("should return an array with all the disasters in db when db not empty", async () => {
        const now = new Date().toISOString();
        const constructedObject1 = {
            femaId: randomUUIDv7(),
            state: 25,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 1000,
            startDate: now,
            endDate: now,
        } satisfies CreateDisasterDTO;

        const constructedObject2 = {
            femaId: randomUUIDv7(),
            state: 22,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "U",
            designatedArea: "Suffolk (County)",
            disasterNumber: 2,
            fipsCountyCode: 1000,
            startDate: now,
            endDate: now,
        } satisfies CreateDisasterDTO;

        const constructedObject3 = {
            femaId: randomUUIDv7(),
            state: 20,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "E",
            designatedArea: "Suffolk (County)",
            disasterNumber: 3,
            fipsCountyCode: 1000,
            startDate: now,
            endDate: now,
        } satisfies CreateDisasterDTO;

        await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(constructedObject1),
        });

        await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(constructedObject2),
        });

        await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(constructedObject3),
        });

        const response = await app.request("/disaster", {
            method: "GET",
        });
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(() => GetAllDisastersResponseSchema.parse(responseBody)).not.toThrow();
        expect(responseBody.length).toBe(3);
        expect(responseBody[0]).toEqual(constructedObject1);
        expect(responseBody[1]).toEqual(constructedObject2);
        expect(responseBody[2]).toEqual(constructedObject3);
    });
});
