import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import {
    CreateDisasterAPIResponse,
    CreateDisasterDTO,
    CreateDisasterDTOInput,
    GetAllDisastersResponseSchema,
    CreateDisasterResponseSchema,
} from "../../types/disaster";
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
            id: randomUUIDv7(),
            fipsStateCode: 25,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 555,
            incidentBeginDate: now,
            incidentEndDate: now,
            incidentType: "Other",
        } satisfies CreateDisasterDTOInput;

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
            "id",
            "fipsStateCode",
        ] as (keyof Exclude<CreateDisasterAPIResponse, { error: string }>)[];

        for (const key of responseKeys) {
            expect(responseBody[key]).toBe(constructedObject[key]);
        }
    });

    it("should not accept an invalid state number", async () => {

        const constructedObject = {
                id: randomUUIDv7(),
                fipsStateCode: 100, // over the 56 limit
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "Z",
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 555,
                incidentBeginDate: new Date().toISOString(),
                incidentEndDate: new Date().toISOString(),
                incidentType: "Other",
            } satisfies CreateDisasterDTOInput;
            
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(constructedObject)});

        expect((await response.json()).error).toContain("expected number to be <=56");
    });

    it("should not accept an invalid county number", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: randomUUIDv7(),
                fipsStateCode: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "Z",
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 9999999, // over the three digit limit
                incidentBeginDate: new Date().toISOString(),
                incidentEndDate: new Date().toISOString(),
                incidentType: "Other",
            } satisfies CreateDisasterDTOInput),
        });

        expect((await response.json()).error).toContain("expected number to be <=1000");
    });

    it("should not accept an invalid set of incident codes", async () => {
        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: randomUUIDv7(),
                fipsStateCode: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "9,Z,W", // 9 is not valid
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 555,
                incidentBeginDate: new Date().toISOString(),
                incidentEndDate: new Date().toISOString(),
                incidentType: "Other",
            } satisfies CreateDisasterDTOInput),
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
                id: randomUUIDv7(),
                fipsStateCode: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "ZW", // Z and W should be separated by `,`
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 555,
                incidentBeginDate: new Date().toISOString(),
                incidentEndDate: new Date().toISOString(),
                incidentType: "Other",
            } satisfies CreateDisasterDTOInput),
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
                id: randomUUIDv7(),
                fipsStateCode: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "ZW", // Z and W should be separated by `,`
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 555,
                incidentBeginDate: new Date().toISOString(),
                incidentEndDate: new Date().toISOString(),
                incidentType: "Other",
            } satisfies CreateDisasterDTOInput),
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
                id: randomUUIDv7(),
                fipsStateCode: 25,
                declarationDate: new Date().toISOString(),
                declarationType: "FM",
                designatedIncidentTypes: "Z",
                designatedArea: "Boston (County)",
                disasterNumber: 1,
                fipsCountyCode: 555,
                incidentBeginDate: new Date("03/25/2025").toISOString(),
                incidentEndDate: new Date("03/20/2025").toISOString(),
                incidentType: "Other",
            } satisfies CreateDisasterDTOInput),
        });
        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.error).toContain("Start date must be after or equal to end date");
    });
});

describe("Get disasters", () => {
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
            method: "GET"
        });

        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBe(0);
    });

    it("should return an array with all the disasters in db when db not empty", async () => {
        const now = new Date().toISOString();
        const constructedObject1 = {
            id: randomUUIDv7(),
            fipsStateCode: 25,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 555,
            incidentBeginDate: now,
            incidentEndDate: now,
            incidentType: "Other",
        } satisfies CreateDisasterDTOInput;

        const constructedObject2 = {
            id: randomUUIDv7(),
            fipsStateCode: 22,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "U",
            designatedArea: "Suffolk (County)",
            disasterNumber: 2,
            fipsCountyCode: 555,
            incidentBeginDate: now,
            incidentEndDate: now,
            incidentType: "Civil Unrest",
        } satisfies CreateDisasterDTOInput;

        const constructedObject3 = {
            id: randomUUIDv7(),
            fipsStateCode: 20,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "E",
            designatedArea: "Suffolk (County)",
            disasterNumber: 3,
            fipsCountyCode: 505,
            incidentBeginDate: now,
            incidentEndDate: now,
            incidentType: "Earthquake",
        } satisfies CreateDisasterDTOInput;

        const inputs = [constructedObject1, constructedObject2, constructedObject3];
        
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
            method: "GET"
        });
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(() => GetAllDisastersResponseSchema.parse(responseBody)).not.toThrow();
        expect(responseBody.length).toBe(3);

        const responseKeys = [
            "id",
            "fipsStateCode",
            "declarationDate",
            "declarationType",
            "designatedIncidentTypes",
            "designatedArea",
            "disasterNumber",
            "fipsCountyCode",
            "incidentBeginDate",
            "incidentEndDate" 
        ] as (keyof Exclude<CreateDisasterDTO, { error: string }>)[];

        for (let i = 0; i < inputs.length; i++) {
            for (const key of responseKeys) {
                expect(responseBody[i][key]).toBe(inputs[i][key]);
            }
        }
        
    });

    it("should overwrite the current disaster if there is a duplicate", async () => {
        const now = new Date().toISOString();
        const femaId = randomUUIDv7();
        const constructedObject1 = {
            id: femaId,
            fipsStateCode: 25,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 487,
            incidentBeginDate: now,
            incidentEndDate: now,
            incidentType: "Other",
        } satisfies CreateDisasterDTOInput;

        const constructedObject2 = {
            id: femaId,
            fipsStateCode: 22,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "U,Z",
            designatedArea: "Suffolk (County)",
            disasterNumber: 2,
            fipsCountyCode: 948,
            incidentBeginDate: now,
            incidentEndDate: now,
            incidentType: "Other",
        } satisfies CreateDisasterDTOInput;

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

        const response = await app.request("/disaster", {
            method: "GET"
        });
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(() => GetAllDisastersResponseSchema.parse(responseBody)).not.toThrow();
        expect(responseBody.length).toBe(1);

        const responseKeys = [
            "id",
            "fipsStateCode",
            "declarationDate",
            "declarationType",
            "designatedIncidentTypes",
            "designatedArea",
            "disasterNumber",
            "fipsCountyCode",
            "incidentBeginDate",
            "incidentEndDate"
        ] as (keyof Exclude<CreateDisasterDTO, { error: string }>)[];
        
            for (const key of responseKeys) {
                expect(responseBody[0][key]).toBe(constructedObject2[key]);
            }
    });

    it("should merge incidentType and designatedIncidentTypes", async () => {
        const now = new Date().toISOString();
        const femaId = randomUUIDv7();
        const constructedObject1 = {
            id: femaId,
            fipsStateCode: 25,
            declarationDate: now,
            declarationType: "FM",
            designatedIncidentTypes: "Z",
            designatedArea: "Boston (County)",
            disasterNumber: 1,
            fipsCountyCode: 487,
            incidentBeginDate: now,
            incidentEndDate: now,
            incidentType: "Fire",
        } satisfies CreateDisasterDTOInput;

        const response = await app.request("/disaster", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(constructedObject1),
        });

        expect(response.status).toBe(201);
        const responseBody = await response.json();
        const returnObject = CreateDisasterResponseSchema.parse(responseBody);
        expect(returnObject.designatedIncidentTypes).toBe("Z,R");
    });
})
