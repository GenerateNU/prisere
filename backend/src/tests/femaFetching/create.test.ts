import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import {
    GetAllDisastersResponseSchema
} from "../../types/disaster";
import { DataSource } from "typeorm";
import { FemaService } from "../../modules/clients/fema-client/service";


describe("Test Fetching Disasters", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource : DataSource;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    afterEach(async () => {
        backup.restore();
    });

    it("should load a three pre-load three months of disaster data", async () => {
        const femaService = new FemaService(dataSource);

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        await femaService.fetchFemaDisasters({lastRefreshDate : threeMonthsAgo});


        const response = await app.request("/disaster", {
            method: "GET"
        });
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);

        const disasters = GetAllDisastersResponseSchema.parse(responseBody);
        expect(disasters.length).toBeGreaterThanOrEqual(1);
        const cutoff = threeMonthsAgo.getTime();
        for (const disaster of disasters) {
            expect(new Date(disaster.declarationDate).getTime()).toBeGreaterThanOrEqual(cutoff);
            expect(disaster.designatedIncidentTypes).not.toBeNull();
        }
    })

    it("should not add any duplicate disasters with the same id", async () => {
        const femaService = new FemaService(dataSource);

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        await femaService.fetchFemaDisasters({lastRefreshDate : threeMonthsAgo});

        const response = await app.request("/disaster", {
            method: "GET"
        });
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        const disasters = GetAllDisastersResponseSchema.parse(responseBody);

        await femaService.fetchFemaDisasters({lastRefreshDate : new Date()});

        const responseAfter = await app.request("/disaster", {
            method: "GET"
        });
        const responseBodyAfter = await responseAfter.json();
        expect(Array.isArray(responseBodyAfter)).toBe(true);
        const disastersAfter = GetAllDisastersResponseSchema.parse(responseBodyAfter);

        expect(disasters.length).toEqual(disastersAfter.length);
        const ids: string[] = [];
        for (let i = 0, n = disasters.length; i < n; i++) {
            expect(ids.includes(disastersAfter[i].id)).toBeFalse();
            expect(disasters[i].id).toEqual(disastersAfter[i].id);
            ids.push(disasters[i].id);
        }
    })

    });