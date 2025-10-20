import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { FemaDisaster } from "../../entities/FemaDisaster";

export const seededDisasters = [
    {
        id: "11111111-1111-1111-1111-111111111111",
        fipsStateCode: 25,
        declarationDate: new Date("2025-01-08T00:00:00.000Z"),
        declarationType: "FM",
        designatedIncidentTypes: "Z",
        designatedArea: "Boston (County)",
        disasterNumber: 1,
        fipsCountyCode: 555,
        incidentBeginDate: new Date("2025-01-08T00:00:00.000Z"),
        incidentEndDate: new Date("2025-02-08T00:00:00.000Z"),
        incidentType: "Other",
    },
    {
        id: "22222222-2222-2222-2222-222222222222",
        fipsStateCode: 25,
        declarationDate: new Date("2025-01-08T00:00:00.000Z"),
        declarationType: "FM",
        designatedIncidentTypes: "Z",
        designatedArea: "Boston (County)",
        disasterNumber: 1,
        fipsCountyCode: 555,
        incidentBeginDate: new Date("2025-01-08T00:00:00.000Z"),
        incidentEndDate: new Date("2025-02-08T00:00:00.000Z"),
        incidentType: "Other",
    },
    {
        id: "33333333-3333-3333-3333-333333333333",
        fipsStateCode: 25,
        declarationDate: new Date("2025-01-08T00:00:00.000Z"),
        declarationType: "FM",
        designatedIncidentTypes: "Z",
        designatedArea: "Boston (County)",
        disasterNumber: 1,
        fipsCountyCode: 555,
        incidentBeginDate: new Date("2025-01-08T00:00:00.000Z"),
        incidentEndDate: new Date("2025-02-08T00:00:00.000Z"),
        incidentType: "Other",
    },
];

export class DisasterSeeder implements Seeder {
    track = false;

    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const disasterRepoitory = dataSource.getRepository(FemaDisaster);
        await disasterRepoitory.insert(seededDisasters);
    }
}
