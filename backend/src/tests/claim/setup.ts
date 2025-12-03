import { DataSource } from "typeorm";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../database/seeds/company.seed";
import { DisasterSeeder, seededDisasters } from "../../database/seeds/disaster.seed";
import { seededSelfDisasters, SelfDisasterSeeder } from "../../database/seeds/selfDisaster.seed";
import { Company, CompanyTypesEnum } from "../../entities/Company";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { ClaimStatusType } from "../../types/ClaimStatusType";

export const insertedClaims = [
    {
        id: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
        name: "Claim 1",
        selfDisasterId: seededSelfDisasters[0].id,
        companyId: "5667a729-f000-4190-b4ee-7957badca27b",
        status: ClaimStatusType.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "5efc380b-e527-4b8d-a784-5c2cc68eba87",
        name: "Claim 2",
        selfDisasterId: "bf2b32dd-c927-440b-8002-84906db3c783",
        companyId: "c0ce685a-27d8-4183-90ff-31f294b2c6da",
        status: ClaimStatusType.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "37d07be0-4e09-4e70-a395-c1464f408c1f",
        name: "Claim 3",
        femaDisasterId: seededDisasters[0].id,
        companyId: "5667a729-f000-4190-b4ee-7957badca27b",
        status: ClaimStatusType.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "2c24c901-38e4-4a35-a1c6-140ce64edf2a",
        name: "Claim 4",
        femaDisasterId: seededDisasters[1].id,
        companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
        status: ClaimStatusType.IN_PROGRESS_BUSINESS,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const initTestData = async (dataSource: DataSource) => {
    const companyRepository = dataSource.getRepository(Company);
    await companyRepository.insert([
        {
            id: "5667a729-f000-4190-b4ee-7957badca27b",
            name: "Northeastern Inc.",
            businessOwnerFullName: "joseph aoun",
            lastQuickBooksInvoiceImportTime: new Date("2023-01-01T12:00:00Z"),
            companyType: CompanyTypesEnum.LLC,
        },
        {
            id: "a1a542da-0abe-4531-9386-8919c9f86369",
            name: "Company Cool",
            businessOwnerFullName: "Cool Guy",
            lastQuickBooksInvoiceImportTime: new Date("2023-02-01T12:00:00Z"),
            companyType: CompanyTypesEnum.LLC,
        },
        {
            id: "c0ce685a-27d8-4183-90ff-31f294b2c6da",
            name: "Company COMPANY",
            businessOwnerFullName: "MA",
            lastQuickBooksInvoiceImportTime: new Date("2023-02-01T12:00:00Z"),
            companyType: CompanyTypesEnum.LLC,
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

    const companySeeder = new CompanySeeder();
    await companySeeder.run(dataSource, {} as SeederFactoryManager);

    const selfDisasterSeeder = new SelfDisasterSeeder();
    await selfDisasterSeeder.run(dataSource, {} as SeederFactoryManager);

    const femaDisasterSeeder = new DisasterSeeder();
    await femaDisasterSeeder.run(dataSource, {} as SeederFactoryManager);

    const claimRepository = dataSource.getRepository("Claim");
    await claimRepository.insert(insertedClaims);
};
