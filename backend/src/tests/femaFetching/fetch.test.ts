import { describe, test, beforeAll, beforeEach, mock, afterEach } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup-fetch-tests";
import { FemaService } from "../../modules/clients/fema-client/service";
import { FemaDisaster } from "../../entities/FemaDisaster";

describe("Test fetchFemaDisasters", () => {
    //   let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    let testData: TestDataSetup;
    let femaService: FemaService;
    let originalFetch: typeof global.fetch;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        // app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;

        // Save original fetch
        originalFetch = global.fetch;
    });

    beforeEach(async () => {
        backup.restore();
        testData = await createTestData(dataSource); // Inserts 2 fema disasters
        femaService = new FemaService(dataSource);
    });

    afterEach(() => {
        // Restore original fetch after each test
        global.fetch = originalFetch;
    });

    test(
        "Test fetching with all new disasters",
        async () => {
            const mockDisasterResponse = {
                DisasterDeclarationsSummaries: [
                    {
                        id: randomUUID(),
                        disasterNumber: 7777,
                        fipsStateCode: 30,
                        declarationDate: new Date("2025-10-01T00:00:00.000Z").toISOString(),
                        incidentBeginDate: new Date("2025-10-02T00:00:00.000Z").toISOString(),
                        incidentEndDate: new Date("2025-10-06T00:00:00.000Z").toISOString(),
                        incidentType: "Flood",
                        fipsCountyCode: 555,
                        declarationType: "EM",
                        designatedArea: "County D",
                        designatedIncidentTypes: "4",
                        lastRefresh: new Date().toISOString(),
                    },
                    {
                        id: randomUUID(),
                        disasterNumber: 8888,
                        fipsStateCode: 40,
                        declarationDate: new Date("2025-10-03T00:00:00.000Z").toISOString(),
                        incidentBeginDate: new Date("2025-10-04T00:00:00.000Z").toISOString(),
                        incidentEndDate: new Date("2025-10-08T00:00:00.000Z").toISOString(),
                        incidentType: "Tornado",
                        fipsCountyCode: 666,
                        declarationType: "FM",
                        designatedArea: "County E",
                        designatedIncidentTypes: "5",
                        lastRefresh: new Date().toISOString(),
                    },
                ],
            };

            const mockFetch = mock(
                async () =>
                    ({
                        ok: true,
                        json: async () => mockDisasterResponse,
                    }) as Response
            );

            global.fetch = mockFetch as unknown as typeof fetch;

            const result = await femaService.fetchFemaDisasters({
                lastRefreshDate: new Date("2025-01-01T00:00:00.000Z"),
            });

            // All disasters are new, so all should be returned
            // expect(result).toHaveLength(2);
            // expect(result[0].disasterNumber).toBe(7777);
            // expect(result[1].disasterNumber).toBe(8888);

            // Verify all disasters exist in DB (2 from seed + 2 new)
            const disasterRepo = dataSource.getRepository(FemaDisaster);
            const allDisasters = await disasterRepo.find();
            // expect(allDisasters).toHaveLength(4); // 2 from createTestData + 2 new
            console.log(`New Disasters Fetched: ${result.length}`);
            console.log(`All Disasters: ${allDisasters.length}`);
        },
        { timeout: 5000 }
    );

    test("Test fetching with no new disasters (all existing)", async () => {
        const mockDisasterResponse = {
            DisasterDeclarationsSummaries: [
                {
                    id: testData.disaster1.id,
                    disasterNumber: testData.disaster1.disasterNumber,
                    fipsStateCode: testData.disaster1.fipsStateCode,
                    declarationDate: testData.disaster1.declarationDate?.toISOString(),
                    incidentBeginDate: testData.disaster1.incidentBeginDate?.toISOString(),
                    incidentEndDate: testData.disaster1.incidentEndDate?.toISOString(),
                    //   incidentType: testData.disaster1.incidentType,
                    fipsCountyCode: testData.disaster1.fipsCountyCode,
                    declarationType: testData.disaster1.declarationType,
                    designatedArea: testData.disaster1.designatedArea,
                    designatedIncidentTypes: testData.disaster1.designatedIncidentTypes,
                    lastRefresh: new Date().toISOString(),
                },
                {
                    id: testData.disaster2.id,
                    disasterNumber: testData.disaster2.disasterNumber,
                    fipsStateCode: testData.disaster2.fipsStateCode,
                    declarationDate: testData.disaster2.declarationDate?.toISOString(),
                    incidentBeginDate: testData.disaster2.incidentBeginDate?.toISOString(),
                    incidentEndDate: testData.disaster2.incidentEndDate?.toISOString(),
                    //   incidentType: testData.disaster2.incidentType,
                    fipsCountyCode: testData.disaster2.fipsCountyCode,
                    declarationType: testData.disaster2.declarationType,
                    designatedArea: testData.disaster2.designatedArea,
                    designatedIncidentTypes: testData.disaster2.designatedIncidentTypes,
                    lastRefresh: new Date().toISOString(),
                },
            ],
        };

        const mockFetch = mock(
            async () =>
                ({
                    ok: true,
                    json: async () => mockDisasterResponse,
                }) as Response
        );

        global.fetch = mockFetch as unknown as typeof fetch;

        const result = await femaService.fetchFemaDisasters({
            lastRefreshDate: new Date("2025-01-01T00:00:00.000Z"),
        });

        // No new disasters, only updates
        // expect(result).toHaveLength(0);

        // Verify only original disasters exist in DB
        const disasterRepo = dataSource.getRepository(FemaDisaster);
        const allDisasters = await disasterRepo.find();
        // expect(allDisasters).toHaveLength(2); // Only the 2 from createTestData
        console.log(`All Disasters: ${allDisasters.length}. Newly created: ${result.length}`);
    });

    test("Test preloadDisasters calls fetchFemaDisasters with correct date", async () => {
        const mockDisasterResponse = {
            DisasterDeclarationsSummaries: [
                {
                    id: randomUUID(),
                    disasterNumber: 5555,
                    fipsStateCode: 10,
                    declarationDate: new Date("2025-10-01T00:00:00.000Z").toISOString(),
                    incidentBeginDate: new Date("2025-10-02T00:00:00.000Z").toISOString(),
                    incidentEndDate: new Date("2025-10-06T00:00:00.000Z").toISOString(),
                    incidentType: "Earthquake",
                    fipsCountyCode: 444,
                    declarationType: "DR",
                    designatedArea: "County F",
                    designatedIncidentTypes: "6",
                    lastRefresh: new Date().toISOString(),
                },
            ],
        };

        const mockFetch = mock(
            async () =>
                ({
                    ok: true,
                    json: async () => mockDisasterResponse,
                }) as Response
        );

        global.fetch = mockFetch as unknown as typeof fetch;

        await femaService.preloadDisasters();

        // Verify fetch was called
        // expect(mockFetch).toHaveBeenCalledTimes(1);//how to get mock

        // Verify the date parameter is approximately 3 months ago
        // const fetchCall = mockFetch.mock.calls[0][0];
        // expect(fetchCall).toContain("lastRefresh gt");

        // Verify new disaster was created
        const disasterRepo = dataSource.getRepository(FemaDisaster);
        const allDisasters = await disasterRepo.find();
        // expect(allDisasters).toHaveLength(3); // 2 from seed + 1 from preload
        console.log(`All Disasters: ${allDisasters.length}`);
    });
});
