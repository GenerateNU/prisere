import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import { GetAllDisastersResponseSchema } from "../../types/disaster";
import { DataSource } from "typeorm";
import { FemaService } from "../../modules/clients/fema-client/service";
import { TESTING_PREFIX } from "../../utilities/constants";
import { MockFemaService } from "./mock-fetch-client";

describe("Test Fetching Disasters", () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    let mockFemaService: MockFemaService;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
        mockFemaService = new MockFemaService();
    });

    afterEach(async () => {
        backup.restore();
    });

    // TODO: make a proper mock FEMA client to handle these tests.
    it("should load a three pre-load one week of disaster data", async () => {
        // const femaService = new FemaService(dataSource);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        oneWeekAgo.setHours(0, 0, 0, 0);
        const disasters = await mockFemaService.fetchFemaDisasters({ lastRefreshDate: oneWeekAgo });

        expect(disasters.length).toBeGreaterThanOrEqual(1);
        const cutoff = oneWeekAgo.getTime();
        for (const disaster of disasters) {
            expect(new Date(disaster.declarationDate).getTime()).toBeGreaterThanOrEqual(cutoff);
            // NOTE: This test potentially fails because we are fetching all FEMA disasters that were __refreshed__ in the last
            // week, so they will not necessarily have been declared in the past week.
            expect(disaster.designatedIncidentTypes).not.toBeNull();
        }
    });

    it(
        "should not add any duplicate disasters with the same id",
        async () => {
            const femaService = new FemaService(dataSource);

            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            await femaService.fetchFemaDisasters({ lastRefreshDate: threeMonthsAgo });

            const response = await app.request(TESTING_PREFIX + "/disaster", {
                method: "GET",
            });
            const responseBody = await response.json();
            expect(Array.isArray(responseBody)).toBe(true);
            const disasters = GetAllDisastersResponseSchema.parse(responseBody);

            await femaService.fetchFemaDisasters({ lastRefreshDate: new Date() });

            const responseAfter = await app.request(TESTING_PREFIX + "/disaster", {
                method: "GET",
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
        },
        { timeout: 50000 }
    );
});
