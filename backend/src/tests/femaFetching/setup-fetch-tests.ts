import { DataSource } from "typeorm";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { randomUUID } from "crypto";

export interface TestDataSetup {
    disaster1: Partial<FemaDisaster>;
    disaster2: Partial<FemaDisaster>;
}

export const createTestData = async (dataSource: DataSource): Promise<TestDataSetup> => {
    const seedDisasters = [
        {
            id: randomUUID(),
            disasterNumber: 1011,
            fipsStateCode: 23,
            declarationDate: new Date("2025-09-28T00:00:00.000Z"),
            incidentBeginDate: new Date("2025-09-29T00:00:00.000Z"),
            incidentEndDate: new Date("2025-10-05T00:00:00.000Z"),
            incidentType: "bad",
            fipsCountyCode: 999,
            declarationType: "11",
            designatedArea: "County A",
            designatedIncidentTypes: "1",
        },
        {
            id: randomUUID(),
            disasterNumber: 1012,
            fipsStateCode: 24,
            declarationDate: new Date("2025-09-28T00:00:00.000Z"),
            incidentBeginDate: new Date("2025-09-29T00:00:00.000Z"),
            incidentEndDate: new Date("2025-10-05T00:00:00.000Z"),
            incidentType: "worse",
            fipsCountyCode: 888,
            declarationType: "12",
            designatedArea: "County B",
            designatedIncidentTypes: "2",
        },
    ];

    const disasterRepository = dataSource.getRepository(FemaDisaster);
    await disasterRepository.insert(seedDisasters);

    const result = {
        disaster1: { ...seedDisasters[0] },
        disaster2: { ...seedDisasters[1] },
    };
    return result;
};
