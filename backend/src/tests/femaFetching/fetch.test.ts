import { describe, beforeAll, beforeEach, it, expect } from "bun:test";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { DisasterSeeder } from "../../database/seeds/disaster.seed";
import { SeederFactoryManager } from "typeorm-extension";
import { MockFemaService } from "./mock-fetch-client";

describe("Test fetchFemaDisasters", () => {
    let backup: IBackup;
    let dataSource: DataSource;
    // let femaService: FemaService;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let mockFemaService: MockFemaService;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
    });

    beforeEach(async () => {
        backup.restore();
        const disasterSeeder = new DisasterSeeder();
        await disasterSeeder.run(dataSource, {} as SeederFactoryManager);
        // const disasters = await dataSource.getRepository(FemaDisaster).find();
        // femaService = new FemaService(dataSource);
        mockFemaService = new MockFemaService();
    });

    describe("MockFemaService", () => {
        let mockFemaService: MockFemaService;

        beforeEach(() => {
            mockFemaService = new MockFemaService();
        });

        it("should return mock disasters", async () => {
            const lastRefreshDate = new Date("2024-01-01T00:00:00.000Z");
            const disasters = await mockFemaService.fetchFemaDisasters({ lastRefreshDate });

            expect(disasters).toHaveLength(2);
            expect(disasters[0].disasterNumber).toBe(4001);
        });

        it("should handle custom mock data", async () => {
            const customDisaster = MockFemaService.createMockDisaster({
                disasterNumber: 5000,
                designatedArea: "Custom Area",
            });

            mockFemaService.setMockDisasters([customDisaster]);

            const disasters = await mockFemaService.fetchFemaDisasters({
                lastRefreshDate: new Date("2020-01-01"),
            });

            expect(disasters).toHaveLength(1);
            expect(disasters[0].disasterNumber).toBe(5000);
            expect(disasters[0].designatedArea).toBe("Custom Area");
        });

        it("should simulate API errors", async () => {
            mockFemaService.setError(true, "Network timeout");

            await expect(
                mockFemaService.fetchFemaDisasters({
                    lastRefreshDate: new Date(),
                })
            ).rejects.toThrow("Network timeout");
        });

        it("should filter disasters by date", async () => {
            const futureDate = new Date();
            const disasters = await mockFemaService.fetchFemaDisasters({
                lastRefreshDate: futureDate,
            });

            expect(disasters).toHaveLength(0);
        });
    });
});
