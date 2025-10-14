import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Company } from "../../entities/Company.js";

const seededCompanies = [
    {
        // NEU
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        name: "Northeastern Inc.",
    },
    {
        // Big Corp
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        name: "Big Corp",
    },
    {
        // Small LLC
        id: "0b6d17e5-37fa-4fe6-bca5-1a18051ae222",
        name: "Small LLC",
    },
    {
        id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
        name: "Institue of Company.",
    },
    {
        // Business
        id: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f",
        name: "Business",
    },
];

export default class CompanySeeder implements Seeder {
    track = false;

    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(Company, seededCompanies);
    }
}
