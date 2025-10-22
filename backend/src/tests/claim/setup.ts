import { DataSource } from "typeorm";
import { Company } from "../../entities/Company";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { ClaimStatusType } from "../../types/ClaimStatusType";

export const initTestData = async (dataSource: DataSource) => {
    const companyRepository = dataSource.getRepository(Company);
    await companyRepository.insert([
        {
            id: "5667a729-f000-4190-b4ee-7957badca27b",
            name: "Northeastern Inc.",
            businessOwnerFullName: "joseph aoun",
            lastQuickBooksImportTime: new Date("2023-01-01T12:00:00Z"),
        },
        {
            id: "a1a542da-0abe-4531-9386-8919c9f86369",
            name: "Company Cool",
            businessOwnerFullName: "Cool Guy",
            lastQuickBooksImportTime: new Date("2023-02-01T12:00:00Z"),
        },
        {
            id: "c0ce685a-27d8-4183-90ff-31f294b2c6da",
            name: "Company COMPANY",
            businessOwnerFullName: "MA",
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

    const claimRepository = dataSource.getRepository("Claim");
    await claimRepository.insert([
        {
            id: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
            disasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            status: ClaimStatusType.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "5efc380b-e527-4b8d-a784-5c2cc68eba87",
            disasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
            companyId: "c0ce685a-27d8-4183-90ff-31f294b2c6da",
            status: ClaimStatusType.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "37d07be0-4e09-4e70-a395-c1464f408c1f",
            disasterId: "47f0c515-2efc-49c3-abb8-623f48817950",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            status: ClaimStatusType.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "2c24c901-38e4-4a35-a1c6-140ce64edf2a",
            disasterId: "2aa52e71-5f89-4efe-a820-1bfc65ded6ec",
            companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
            status: ClaimStatusType.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
};
