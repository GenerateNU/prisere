import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { FemaDisaster } from "../../entities/FemaDisaster";

const seededDisasters = [
    {
        // Disaster 1
        id: "9c8b7a6f-5e4d-3c2b-1a09-8f7e6d5c4b3a",
        disasterNumber: 12345,
        fipsStateCode: 6,
        declarationDate: new Date(),
        incidentBeginDate: new Date(),
        incidentEndDate: new Date(),
        incidentType: "Flood",
        fipsCountyCode: 1,
        declarationType: "Major Disaster",
        designatedArea: "Test Area",
        designatedIncidentTypes: "Flooding",
    },
    {
        // Disaster 2
        id: "2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b",
        disasterNumber: 67890,
        fipsStateCode: 12,
        declarationDate: new Date(),
        incidentBeginDate: new Date(),
        incidentEndDate: new Date(),
        incidentType: "Hurricane",
        fipsCountyCode: 2,
        declarationType: "Medium",
        designatedArea: "Test Area 2",
        designatedIncidentTypes: "Wind",
    },
    {
        // Disaster 3
        id: "5d4c3b2a-1f0e-9d8c-7b6a-5f4e3d2c1b0a",
        disasterNumber: 67820,
        fipsStateCode: 12,
        declarationDate: new Date(),
        incidentBeginDate: new Date(),
        incidentEndDate: new Date(),
        incidentType: "Hurricane",
        fipsCountyCode: 2,
        declarationType: "Medium",
        designatedArea: "Test Area 2",
        designatedIncidentTypes: "Wind",
    },
    {
        // Disaster 4
        id: "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
        disasterNumber: 62890,
        fipsStateCode: 12,
        declarationDate: new Date(),
        incidentBeginDate: new Date(),
        incidentEndDate: new Date(),
        incidentType: "Hurricane",
        fipsCountyCode: 2,
        declarationType: "Medium",
        designatedArea: "Test Area 2",
        designatedIncidentTypes: "Wind",
    },
    {
        // Disaster 5
        id: "1f2e3d4c-5b6a-7f8e-9d0c-1b2a3f4e5d6c",
        disasterNumber: 67892,
        fipsStateCode: 12,
        declarationDate: new Date(),
        incidentBeginDate: new Date(),
        incidentEndDate: new Date(),
        incidentType: "Hurricane",
        fipsCountyCode: 2,
        declarationType: "Medium",
        designatedArea: "Test Area 2",
        designatedIncidentTypes: "Wind",
    },
];

export class FemaDisasterSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(FemaDisaster);
        await repository.insert(seededDisasters);
    }
}
