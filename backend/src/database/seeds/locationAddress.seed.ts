import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { LocationAddress } from "../../entities/LocationAddress";

export const seededLocationAddresses = [
    {
        // Business Location 1
        id: "5e6f7a8b-9c0d-4e2f-8a4b-5c6d7e8f9a0b",
        alias: "Business Location 1",
        country: "USA",
        stateProvince: "CA",
        city: "Los Angeles",
        streetAddress: "123 Main St - business",
        postalCode: "90001",
        county: "Los Angeles",
        companyId: "7f8e9d0c-1b2a-3c4d-5e6f-7a8b9c0d1e2f",
        fipsStateCode: 36,
        fipsCountyCode: 61,
    },
    {
        // NEU Location 1
        id: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
        alias: "NEU Location 1",
        country: "USA",
        stateProvince: "CA",
        city: "Los Angeles",
        streetAddress: "123 Main St - neu",
        postalCode: "90001",
        county: "Los Angeles",
        companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        fipsStateCode: 36,
        fipsCountyCode: 61,
    },
    {
        // NEU Location 2
        id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        alias: "NEU Location 2",
        country: "USA",
        stateProvince: "CA",
        city: "Los Angeles",
        streetAddress: "123 Main St - neu",
        postalCode: "90001",
        county: "Los Angeles",
        companyId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        fipsStateCode: 36,
        fipsCountyCode: 61,
    },
    {
        // Big Corp Location 1
        id: "b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e",
        alias: "Big Corp Location 1",
        country: "USA",
        stateProvince: "CA",
        city: "Los Angeles",
        streetAddress: "123 Main St - big corp",
        postalCode: "90001",
        county: "Los Angeles",
        companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        fipsStateCode: 36,
        fipsCountyCode: 61,
    },
    {
        // Small LLC Location 1
        id: "e7f8a9b0-c1d2-4e3f-5a6b-7c8d9e0f1a2b",
        alias: "Small LLC Location 1",
        country: "USA",
        stateProvince: "CA",
        city: "Los Angeles",
        streetAddress: "123 Main St - small llc",
        postalCode: "90001",
        county: "Los Angeles",
        companyId: "0b6d17e5-37fa-4fe6-bca5-1a18051ae222",
        fipsStateCode: 36,
        fipsCountyCode: 61,
    },
    {
        // Big Corp Location 2
        id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
        alias: "Big Corp Location 2",
        country: "USA",
        stateProvince: "CA",
        city: "Los Angeles",
        streetAddress: "123 Main St - big corp 2",
        postalCode: "90001",
        county: "Los Angeles",
        companyId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        fipsStateCode: 36,
        fipsCountyCode: 61,
    },
];

export class LocationAddressSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(LocationAddress);
        await repository.insert(seededLocationAddresses);
    }
}
