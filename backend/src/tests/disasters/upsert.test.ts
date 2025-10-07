import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { startTestApp } from "../setup-tests";
import { IBackup } from "pg-mem";
import { DisasterTransaction } from "../../modules/disaster/transaction";
import { CreateDisasterDTO } from "../../types/disaster";

describe("DisasterTransaction - upsertDisaster", () => {
    let backup: IBackup;
    let dataSource: DataSource;
    let disasterTransaction: DisasterTransaction;

    const mockDisasterData: CreateDisasterDTO = {
        id: randomUUID(),
        disasterNumber: 1011,
        fipsStateCode: 23,
        declarationDate: "2025-09-28T00:00:00.000Z",
        incidentBeginDate: "2025-09-29T00:00:00.000Z",
        incidentEndDate: "2025-10-05T00:00:00.000Z",
        fipsCountyCode: 999,
        declarationType: "11",
        designatedArea: "County A",
        designatedIncidentTypes: "1",
    };

    beforeAll(async () => {
        const testAppData = await startTestApp();
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
        disasterTransaction = new DisasterTransaction(dataSource);
    });

    beforeEach(() => {
        backup.restore();
    });

    afterAll(async () => {
        await dataSource.destroy();
    });

    it("should create a new disaster when it doesn't exist", async () => {
        const result = await disasterTransaction.upsertDisaster(mockDisasterData);

        expect(result.isNew).toBe(true);
        expect(result.disaster).toBeDefined();
        expect(result.disaster.disasterNumber).toBe(mockDisasterData.disasterNumber);
    });

    it("should update an existing disaster when it exists", async () => {
        // First, create a disaster
        await disasterTransaction.upsertDisaster(mockDisasterData);

        // Then, upsert with updated data
        const updatedData: CreateDisasterDTO = {
            ...mockDisasterData,
            declarationType: "12",
            designatedArea: "Updated Area", // Update some values
        };

        const result = await disasterTransaction.upsertDisaster(updatedData);

        expect(result.isNew).toBe(false);
        expect(result.disaster).toBeDefined();
        expect(result.disaster.disasterNumber).toBe(mockDisasterData.disasterNumber);
        // Check that the fields have been updated
        expect(result.disaster.declarationType).toBe("12");
        expect(result.disaster.designatedArea).toBe("Updated Area");
    });

    it("should return the same disaster number for both create and update", async () => {
        // Create
        const createResult = await disasterTransaction.upsertDisaster(mockDisasterData);

        // Update
        const updateResult = await disasterTransaction.upsertDisaster({
            ...mockDisasterData,
            declarationType: "13",
        });

        expect(createResult.disaster.disasterNumber).toBe(updateResult.disaster.disasterNumber);
        expect(createResult.disaster.id).toBe(updateResult.disaster.id);
    });

    it("should handle multiple disasters with different disaster numbers", async () => {
        const disaster1 = { ...mockDisasterData, disasterNumber: 11111 };
        const disaster2 = { ...mockDisasterData, disasterNumber: 22222, id: randomUUID() };

        const result1 = await disasterTransaction.upsertDisaster(disaster1);
        const result2 = await disasterTransaction.upsertDisaster(disaster2);

        expect(result1.isNew).toBe(true);
        expect(result2.isNew).toBe(true);
        expect(result1.disaster.disasterNumber).toBe(11111);
        expect(result2.disaster.disasterNumber).toBe(22222);
    });
});
