import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Claim } from "../../entities/Claim.js";
import { FemaDisaster } from "../../entities/FemaDisaster.js";
import { Company } from "../../entities/Company.js";

export default class ClaimSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const companyRepository = dataSource.getRepository(Company);
        await companyRepository.insert([
            {
                id: "5667a729-f000-4190-b4ee-7957badca27b",
                name: "Northeastern Inc.",
                lastQuickBooksImportTime: new Date("2023-01-01T12:00:00Z"),
            },
            {
                id: "a1a542da-0abe-4531-9386-8919c9f86369",
                name: "Company Cool",
                lastQuickBooksImportTime: new Date("2023-02-01T12:00:00Z"),
            },
        ]);

        const disasterRepository = dataSource.getRepository(FemaDisaster);
        await disasterRepository.insert([
            {
                id: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
                disasterNumber: 12345,
                fipsStateCode: 6,
                declarationDate: new Date(),
                incidentBeginDate: new Date(),
                incidentEndDate: new Date(),
                fipsCountyCode: 1,
                declarationType: "Major Disaster",
                designatedArea: "Test Area",
                designatedIncidentTypes: "Flooding",
            },
            {
                id: "47f0c515-2efc-49c3-abb8-623f48817950",
                disasterNumber: 67890,
                fipsStateCode: 12,
                declarationDate: new Date(),
                incidentBeginDate: new Date(),
                incidentEndDate: new Date(),
                fipsCountyCode: 2,
                declarationType: "Medium",
                designatedArea: "Test Area 2",
                designatedIncidentTypes: "Wind",
            },
        ]);

        const repository = dataSource.getRepository(Claim);
        await repository.insert([
            {
                id: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
                disasterId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
                companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
            },
        ]);
    }
}
