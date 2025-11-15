import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Company, CompanyTypesEnum } from "../../entities/Company.js";

export const seededCompanies = [
    {
        // NEU
        id: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        businessOwnerFullName: "Garfield Parrish",
        name: "Northeastern Inc.",
        companyType: CompanyTypesEnum.LLC,
    },
    {
        // Big Corp
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        businessOwnerFullName: "Vincent Hodges",
        name: "Big Corp",
        companyType: CompanyTypesEnum.LLC,
    },
    {
        // Small LLC
        id: "0b6d17e5-37fa-4fe6-bca5-1a18051ae222",
        businessOwnerFullName: "Molly Michael",
        name: "Small LLC",
        companyType: CompanyTypesEnum.LLC,
    },
    {
        id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
        businessOwnerFullName: "Damien Douglas",
        name: "Institue of Company.",
        companyType: CompanyTypesEnum.LLC,
    },
    {
        // Business
        id: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f",
        businessOwnerFullName: "Ruben Ross",
        name: "Business",
        companyType: CompanyTypesEnum.LLC,
    },

    {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        name: "Test Company ABC",
        lastQuickBooksImportTime: new Date("2025-01-15T10:30:00Z"),
        businessOwnerFullName: "Alvin Hebert",
        companyType: CompanyTypesEnum.LLC,
    },
    {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Test Company DEF",
        businessOwnerFullName: "Crystal Cherry",
        companyType: CompanyTypesEnum.LLC,
    },
    {
        id: "12345678-9abc-1234-5678-56789abcdef0",
        name: "Test Company EFG",
        lastQuickBooksImportTime: new Date("2025-02-01T14:45:00Z"),
        businessOwnerFullName: "Felix Spence",
        companyType: CompanyTypesEnum.LLC,
    },

    {
        id: "35fe231e-0635-49c7-9096-4b6a17b3639b",
        name: "Generate and Associates",
        lastQuickBooksImportTime: new Date("2023-02-01T12:00:00Z"),
        businessOwnerFullName: "Melvin Roy",
        companyType: CompanyTypesEnum.LLC,
    },
];

export default class CompanySeeder implements Seeder {
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(Company, seededCompanies);
    }
}
