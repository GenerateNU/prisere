import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { SelfDeclaredDisaster } from "../../entities/SelfDisaster";
import { seededCompanies } from "./company.seed";

export const seededSelfDisasters: Partial<SelfDeclaredDisaster>[] = [
    {
        id: "ba5735c4-fbd1-4f7d-97c1-bf5af2a3f533",
        name: "Test Disaster 1",
        companyId: seededCompanies[0].id,
        description: "Hello world",
        startDate: new Date("01/01/2025"),
    },
    {
        id: "bf2b32dd-c927-440b-8002-84906db3c783",
        name: "Test Disaster 2",
        companyId: seededCompanies[0].id,
        description: "Hello world",
        startDate: new Date("06/20/2025"),
        endDate: new Date("06/30/2025"),
    },
];

export class SelfDisasterSeeder implements Seeder {
    track = false;

    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(SelfDeclaredDisaster, seededSelfDisasters);
    }
}
