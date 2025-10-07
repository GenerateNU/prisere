// import { describe, it, expect, beforeAll, afterAll, beforeEach, mock } from "bun:test";
// import { DataSource } from "typeorm";
// import { randomUUID } from "crypto";
// import { startTestApp } from "../setup-tests";
// import { IBackup } from "pg-mem";
// import { FemaService } from "../../modules/clients/fema-client/service";
// import { DisasterTransaction } from "../../modules/disaster/transaction";

// describe("FemaService - fetchFemaDisasters (returns new disasters only)", () => {
//     let backup: IBackup;
//     let dataSource: DataSource;
//     let femaService: FemaService;
//     let disasterTransaction: DisasterTransaction;
//     let originalFetch: typeof fetch;

//     const mockFemaResponse = {
//         DisasterDeclarationsSummaries: [
//             {
//                 id: randomUUID(),
//                 disasterNumber: 12345,
//                 fipsStateCode: 6,
//                 declarationDate: "2024-01-01T00:00:00.000Z",
//                 incidentBeginDate: "2024-01-01T00:00:00.000Z",
//                 incidentEndDate: "2024-01-02T00:00:00.000Z",
//                 incidentType: "Flood",
//                 fipsCountyCode: 1,
//                 declarationType: "Major Disaster",
//                 designatedArea: "Test Area 1",
//                 designatedIncidentTypes: "Flooding",
//             },
//             {
//                 id: randomUUID(),
//                 disasterNumber: 67890,
//                 fipsStateCode: 12,
//                 declarationDate: "2024-01-01T00:00:00.000Z",
//                 incidentBeginDate: "2024-01-01T00:00:00.000Z",
//                 incidentEndDate: "2024-01-02T00:00:00.000Z",
//                 incidentType: "Hurricane",
//                 fipsCountyCode: 2,
//                 declarationType: "Major Disaster",
//                 designatedArea: "Test Area 2",
//                 designatedIncidentTypes: "Wind",
//             },
//         ],
//     };

//     beforeAll(async () => {
//         // Store original fetch
//         originalFetch = global.fetch;
        
//         const testAppData = await startTestApp();
//         backup = testAppData.backup;
//         dataSource = testAppData.dataSource;
//         femaService = new FemaService(dataSource);
//         disasterTransaction = new DisasterTransaction(dataSource);
//     });

//     beforeEach(() => {
//         backup.restore();
        
//         // Reset mock before each test
//         global.fetch = mock(() =>
//             Promise.resolve({
//                 json: () => Promise.resolve(mockFemaResponse),
//             })
//         ) as typeof fetch;
//     });

//     afterAll(async () => {
//         // Restore original fetch
//         global.fetch = originalFetch;
//         await dataSource.destroy();
//     });

//     it("should return all disasters when none exist in database", async () => {
//         const lastRefreshDate = new Date();
//         lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);

//         const result = await femaService.fetchFemaDisasters({ lastRefreshDate });

//         expect(result).toHaveLength(2);
//         expect(result[0].disasterNumber).toBe(12345);
//         expect(result[1].disasterNumber).toBe(67890);
//     });

//     it("should return only new disasters when some already exist", async () => {
//         // Pre-insert one disaster
//         await disasterTransaction.upsertDisaster({
//             id: randomUUID(),
//             disasterNumber: 12345,
//             fipsStateCode: 6,
//             declarationDate: new Date("2024-01-01"),
//             incidentBeginDate: new Date("2024-01-01"),
//             incidentEndDate: new Date("2024-01-02"),
//             incidentType: "Flood",
//             fipsCountyCode: 1,
//             declarationType: "Major Disaster",
//             designatedArea: "Existing Area",
//             designatedIncidentTypes: "Flooding",
//         });

//         const lastRefreshDate = new Date();
//         lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);

//         const result = await femaService.fetchFemaDisasters({ lastRefreshDate });

//         // Should only return the new disaster (67890), not the existing one (12345)
//         expect(result).toHaveLength(1);
//         expect(result[0].disasterNumber).toBe(67890);
//     });

//     it("should handle empty response from FEMA API", async () => {
//         // Override mock for this specific test
//         global.fetch = mock(() =>
//             Promise.resolve({
//                 json: () => Promise.resolve({ DisasterDeclarationsSummaries: [] }),
//             })
//         ) as typeof fetch;

//         const lastRefreshDate = new Date();
//         lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);

//         const result = await femaService.fetchFemaDisasters({ lastRefreshDate });

//         expect(result).toHaveLength(0);
//     });

//     it("should call FEMA API with correct parameters", async () => {
//         const mockFetchSpy = mock(() =>
//             Promise.resolve({
//                 json: () => Promise.resolve({ DisasterDeclarationsSummaries: [] }),
//             })
//         );
//         global.fetch = mockFetchSpy as typeof fetch;

//         const lastRefreshDate = new Date("2024-01-01T00:00:00.000Z");
//         await femaService.fetchFemaDisasters({ lastRefreshDate });

//         expect(mockFetchSpy).toHaveBeenCalledTimes(1);
//         const calledUrl = mockFetchSpy.mock.calls[0][0];
        
//         expect(calledUrl).toContain("https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries");
//         expect(calledUrl).toContain("declarationDate ge");
//         expect(calledUrl).toContain("lastRefresh gt 2024-01-01T00:00:00.000Z");
//     });
// });