import { DataSource } from "typeorm";
import { Claim } from "../../../entities/Claim";
import { ClaimLocation } from "../../../entities/ClaimLocation";
import { Company, CompanyTypesEnum } from "../../../entities/Company";
import { FemaDisaster } from "../../../entities/FemaDisaster";
import { LocationAddress } from "../../../entities/LocationAddress";
import { Purchase } from "../../../entities/Purchase";
import { PurchaseLineItem, PurchaseLineItemType } from "../../../entities/PurchaseLineItem";
import { SelfDeclaredDisaster } from "../../../entities/SelfDisaster";
import { User } from "../../../entities/User";
import { ClaimStatusType } from "../../../types/ClaimStatusType";

export const initPdfTestData = async (dataSource: DataSource) => {
    // 1. Insert Companies
    const companyRepository = dataSource.getRepository(Company);
    await companyRepository.insert([
        {
            id: "5667a729-f000-4190-b4ee-7957badca27b",
            name: "Northeastern Inc.",
            businessOwnerFullName: "Joseph Aoun",
            companyType: CompanyTypesEnum.LLC,
        },
        {
            id: "a1a542da-0abe-4531-9386-8919c9f86369",
            name: "Company Cool",
            businessOwnerFullName: "Cool Guy",
            companyType: CompanyTypesEnum.LLC,
        },
    ]);

    // 2. Insert Users
    const userRepository = dataSource.getRepository(User);
    await userRepository.insert([
        {
            id: "0199e103-5452-76d7-8d4d-92e70c641bdb",
            firstName: "Zahra",
            lastName: "Wibisana",
            email: "zahra.wib@example.com",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            phoneNumber: "0123456789",
        },
        {
            id: "0199e0cc-4e92-702c-9773-071340163ae4",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
            phoneNumber: "0123456789",
        },
    ]);

    // 3. Insert FEMA Disasters
    const femaDisasterRepository = dataSource.getRepository(FemaDisaster);
    await femaDisasterRepository.insert([
        {
            id: "11111111-1111-1111-1111-111111111111",
            disasterNumber: 12345,
            fipsStateCode: 25,
            fipsCountyCode: 555,
            declarationDate: new Date("2024-01-15T00:00:00Z"),
            incidentBeginDate: new Date("2024-01-10T00:00:00Z"),
            incidentEndDate: new Date("2024-01-20T00:00:00Z"),
            declarationType: "Major Disaster",
            designatedArea: "Boston (County)",
            designatedIncidentTypes: "Flooding",
        },
        {
            id: "22222222-2222-2222-2222-222222222222",
            disasterNumber: 67890,
            fipsStateCode: 25,
            fipsCountyCode: 556,
            declarationDate: new Date("2024-03-01T00:00:00Z"),
            incidentBeginDate: new Date("2024-02-28T00:00:00Z"),
            incidentEndDate: new Date("2024-03-05T00:00:00Z"),
            declarationType: "Emergency",
            designatedArea: "Cambridge (County)",
            designatedIncidentTypes: "Wind,Tornado",
        },
    ]);

    // 4. Insert Self-Declared Disasters
    const selfDisasterRepository = dataSource.getRepository(SelfDeclaredDisaster);
    await selfDisasterRepository.insert([
        {
            id: "ba5735c4-fbd1-4f7d-97c1-bf5af2a3f533",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            description: "Fire in main office building",
            startDate: new Date("2024-02-01T00:00:00Z"),
            endDate: new Date("2024-02-02T00:00:00Z"),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    // 5. Insert Location Addresses
    const locationAddressRepository = dataSource.getRepository(LocationAddress);
    await locationAddressRepository.insert([
        {
            id: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
            alias: "NEU Main Office",
            country: "USA",
            stateProvince: "MA",
            city: "Boston",
            streetAddress: "360 Huntington Ave",
            postalCode: "02115",
            county: "Suffolk",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            fipsStateCode: 25,
            fipsCountyCode: 25025,
        },
        {
            id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
            alias: "NEU Secondary Location",
            country: "USA",
            stateProvince: "MA",
            city: "Cambridge",
            streetAddress: "1 Main St",
            postalCode: "02142",
            county: "Middlesex",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            fipsStateCode: 25,
            fipsCountyCode: 25017,
        },
        {
            id: "b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e",
            alias: "Company Cool HQ",
            country: "USA",
            stateProvince: "MA",
            city: "Worcester",
            streetAddress: "456 Cool Street",
            postalCode: "01608",
            county: "Worcester",
            companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
            fipsStateCode: 25,
            fipsCountyCode: 25027,
        },
    ]);

    // 6. Insert Purchases
    const purchaseRepository = dataSource.getRepository(Purchase);
    await purchaseRepository.insert([
        {
            id: "89cac778-b8d8-48c2-a2da-77019c57944e",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            quickBooksId: 108347,
            totalAmountCents: 50000,
            isRefund: false,
            dateCreated: new Date("2024-01-12T12:00:00Z"),
            quickbooksDateCreated: new Date("2024-01-12T12:00:00Z"),
        },
        {
            id: "1ffac23a-aefa-45ef-b0bd-b2b72ceae12e",
            companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
            quickBooksId: 108348,
            totalAmountCents: 30000,
            isRefund: false,
            dateCreated: new Date("2024-03-02T12:00:00Z"),
            quickbooksDateCreated: new Date("2024-03-02T12:00:00Z"),
        },
    ]);

    // 7. Insert Purchase Line Items
    const lineItemRepository = dataSource.getRepository(PurchaseLineItem);
    await lineItemRepository.insert([
        {
            id: "ba4635bf-d3ac-4d11-ac0e-82e658a96d5a",
            description: "Emergency supplies",
            quickBooksId: 999,
            purchaseId: "89cac778-b8d8-48c2-a2da-77019c57944e",
            amountCents: 25000, // $250.00
            category: "Supplies",
            type: PurchaseLineItemType.TYPICAL,
            dateCreated: new Date("2024-01-12T12:00:00Z"),
        },
        {
            id: "bf4c21aa-da49-42cc-9a50-749e70786f9f",
            description: "Temporary housing",
            quickBooksId: 1000,
            purchaseId: "89cac778-b8d8-48c2-a2da-77019c57944e",
            amountCents: 200000, // $2000.00
            category: "Housing",
            type: PurchaseLineItemType.TYPICAL,
            dateCreated: new Date("2024-01-13T12:00:00Z"),
        },
        {
            id: "cf5d32bb-ea5a-53dd-aa61-860f78897fa0",
            description: "Office repair materials",
            quickBooksId: 1001,
            purchaseId: "1ffac23a-aefa-45ef-b0bd-b2b72ceae12e",
            amountCents: 30000, // $300.00
            category: "Repairs",
            type: PurchaseLineItemType.TYPICAL,
            dateCreated: new Date("2024-03-02T12:00:00Z"),
        },
    ]);

    // 8. Insert Claims
    const claimRepository = dataSource.getRepository(Claim);
    await claimRepository.insert([
        {
            id: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
            name: "Claim 1",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            selfDisasterId: "ba5735c4-fbd1-4f7d-97c1-bf5af2a3f533",
            status: ClaimStatusType.ACTIVE,
            createdAt: new Date("2024-02-05T00:00:00Z"),
            updatedAt: new Date("2024-02-05T00:00:00Z"),
        },
        {
            id: "37d07be0-4e09-4e70-a395-c1464f408c1f",
            name: "Claim 3",
            companyId: "5667a729-f000-4190-b4ee-7957badca27b",
            femaDisasterId: "11111111-1111-1111-1111-111111111111",
            status: ClaimStatusType.ACTIVE,
            createdAt: new Date("2024-01-16T00:00:00Z"),
            updatedAt: new Date("2024-01-16T00:00:00Z"),
        },
        {
            id: "2c24c901-38e4-4a35-a1c6-140ce64edf2a",
            name: "Claim 4",
            companyId: "a1a542da-0abe-4531-9386-8919c9f86369",
            femaDisasterId: "22222222-2222-2222-2222-222222222222",
            status: ClaimStatusType.ACTIVE,
            createdAt: new Date("2024-03-02T00:00:00Z"),
            updatedAt: new Date("2024-03-02T00:00:00Z"),
        },
    ]);

    // 9. Insert Claim Locations (link claims to addresses)
    const claimLocationRepository = dataSource.getRepository(ClaimLocation);
    await claimLocationRepository.insert([
        {
            id: "6d5c4b3a-2f1e-0d9c-8b7a-6f5e4d3c2b1a",
            claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
            locationAddressId: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
        },
        {
            id: "0f1a2b3c-4d5e-46f7-a8b9-c0d1e2f3a4b5",
            claimId: "0174375f-e7c4-4862-bb9f-f58318bb2e7d",
            locationAddressId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        },
        {
            id: "9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d",
            claimId: "37d07be0-4e09-4e70-a395-c1464f408c1f",
            locationAddressId: "8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f",
        },
        {
            id: "7b8c9d0e-1f2a-43b4-c5d6-e7f8a9b0c1d2",
            claimId: "2c24c901-38e4-4a35-a1c6-140ce64edf2a",
            locationAddressId: "b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e",
        },
    ]);

    // 10. Link Purchase Line Items to Claims (many-to-many)
    await dataSource
        .createQueryBuilder()
        .relation(Claim, "purchaseLineItems")
        .of("0174375f-e7c4-4862-bb9f-f58318bb2e7d")
        .add(["ba4635bf-d3ac-4d11-ac0e-82e658a96d5a", "bf4c21aa-da49-42cc-9a50-749e70786f9f"]);

    await dataSource
        .createQueryBuilder()
        .relation(Claim, "purchaseLineItems")
        .of("2c24c901-38e4-4a35-a1c6-140ce64edf2a")
        .add(["cf5d32bb-ea5a-53dd-aa61-860f78897fa0"]);
};
