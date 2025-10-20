import { DataSource } from "typeorm";
import { LocationAddress } from "../../entities/LocationAddress";
import { Company } from "../../entities/Company";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { seededCompanies } from "./company.seed";

export const seededLocations = [
    // Added the same company under multiple locations, and one to one
    {
        id: "11111111-1111-1111-1111-111111111111",
        country: "United States",
        stateProvince: "Florida",
        city: "Miami",
        streetAddress: "123 Ocean Drive",
        postalCode: "33139",
        county: "Miami-Dade",
        companyId: seededCompanies[0].id,
        fipsStateCode: 12,
        fipsCountyCode: 86,
    },
    {
        id: "22222222-2222-2222-2222-222222222222",
        country: "United States",
        stateProvince: "Texas",
        city: "Houston",
        streetAddress: "456 Main Street",
        postalCode: "77002",
        county: "Harris",
        companyId: seededCompanies[0].id,
        fipsStateCode: 48,
        fipsCountyCode: 201,
    },
    {
        id: "33333333-3333-3333-3333-333333333333",
        country: "United States",
        stateProvince: "California",
        city: "Los Angeles",
        streetAddress: "789 Sunset Blvd",
        postalCode: "90028",
        county: "Los Angeles",
        companyId: seededCompanies[0].id,
        fipsStateCode: 6,
        fipsCountyCode: 37,
    },
    {
        id: "44444444-4444-4444-4444-444444444444",
        country: "United States",
        stateProvince: "New York",
        city: "New York",
        streetAddress: "321 Broadway",
        postalCode: "10007",
        county: "New York",
        companyId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        fipsStateCode: 36,
        fipsCountyCode: 61,
    },
];

export class LocationSeeder implements Seeder {
    track = false;

    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const locationRepository = dataSource.getRepository(LocationAddress);
        const companyRepository = dataSource.getRepository(Company);

        // Check company exists first
        for (const locationData of seededLocations) {
            const company = await companyRepository.findOne({
                where: { id: locationData.companyId },
            });

            if (!company) {
                throw new Error(`Company with ID ${locationData.companyId} not found. Cannot create location.`);
            }

            await locationRepository.save(locationData);
        }
    }
}
