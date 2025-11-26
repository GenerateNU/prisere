import { describe, it, expect } from "bun:test";
import { ClaimDataForPDF } from "../../../modules/claim/types";
import { PurchaseLineItemType } from "../../../entities/PurchaseLineItem";
import { restructureClaimDataForPdf } from "../../../modules/claim/utilities/pdf-mapper";

describe("restructureClaimDataForPdf", () => {
    const baseClaimDataForPDF: ClaimDataForPDF = {
        id: "claim-123",
        companyId: "company-456",
        femaDisasterId: "fema-123",
        selfDisasterId: undefined,
        user: {
            id: "user-789",
            firstName: "John",
            lastName: "Doe",
            email: "john@test.com",
            phoneNumber: "1234567890",
            companyId: "company-456",
            company: undefined,
            disasterNotifications: undefined!,
            preferences: undefined!,
        },
        company: {
            name: "Test Company Inc.",
        },
        femaDisaster: {
            id: "fema-123",
            designatedIncidentTypes: "flooding,hurricane",
            declarationDate: new Date("2024-01-15"),
            incidentBeginDate: new Date("2024-01-10"),
            incidentEndDate: new Date("2024-01-20"),
        },
        selfDisaster: undefined,
        claimLocations: [
            {
                id: "cloc-1",
                claimId: "claim-123",
                locationAddressId: "addr-1",
                claim: undefined,
                locationAddress: {
                    id: "addr-1",
                    alias: "Main Office",
                    country: "USA",
                    stateProvince: "MA",
                    city: "Boston",
                    streetAddress: "123 Main St",
                    postalCode: "02101",
                    county: "Suffolk",
                    companyId: "company-456",
                    fipsStateCode: 25,
                    fipsCountyCode: 25025,
                    company: undefined,
                    disasterNotifications: undefined,
                    claimLocations: undefined,
                    lat: 0,
                    long: 0,
                },
            },
        ],
        purchaseLineItems: [
            {
                id: "pli-1",
                description: "Emergency supplies",
                quickBooksId: undefined,
                purchase: undefined,
                purchaseId: "purchase-1",
                amountCents: 50000,
                category: undefined,
                type: PurchaseLineItemType.TYPICAL,
                dateCreated: new Date("2024-01-01"),
                lastUpdated: new Date("2024-01-01"),
                quickbooksDateCreated: undefined,
            },
            {
                id: "pli-2",
                description: "Temporary housing",
                quickBooksId: undefined,
                purchase: undefined,
                purchaseId: "purchase-1",
                amountCents: 200000,
                category: undefined,
                type: PurchaseLineItemType.TYPICAL,
                dateCreated: new Date("2024-01-01"),
                lastUpdated: new Date("2024-01-01"),
                quickbooksDateCreated: undefined,
            },
        ],
        averageIncome: 75000.0,
        pastRevenues: [
            { year: 2021, amountCents: 2500000 },
            { year: 2022, amountCents: 3000000 },
            { year: 2023, amountCents: 3500000 },
        ],
        pastPurchases: [
            { year: 2021, amountCents: 125000 },
            { year: 2022, amountCents: 150000 },
            { year: 2023, amountCents: 175000 },
        ],
    };

    it("should successfully parse valid claim data with FEMA disaster", () => {
        const result = restructureClaimDataForPdf(baseClaimDataForPDF);

        expect(result.user.firstName).toBe("John");
        expect(result.user.lastName).toBe("Doe");
        expect(result.user.email).toBe("john@test.com");
        expect(result.company.name).toBe("Test Company Inc.");
        expect(result.femaDisaster).toBeDefined();
        expect(result.femaDisaster).toHaveProperty("id", "fema-123");
        expect(result.femaDisaster).toHaveProperty("designatedIncidentTypes", "flooding,hurricane");
        expect(result.selfDisaster).toBeUndefined();
        expect(result.impactedLocations).toHaveLength(1);
        expect(result.impactedLocations[0].city).toBe("Boston");
        expect(result.relevantExpenses).toHaveLength(2);
        expect(result.averageIncome).toBe(75000.0);
        expect(result.dateGenerated).toBeInstanceOf(Date);
    });

    it("should parse claim data with self-declared disaster", () => {
        const dataWithSelfDisaster: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            femaDisaster: undefined,
            femaDisasterId: undefined,
            selfDisasterId: "self-1",
            selfDisaster: {
                description: "Office fire",
                startDate: new Date("2024-02-01"),
                endDate: new Date("2024-02-02"),
            },
        };

        const result = restructureClaimDataForPdf(dataWithSelfDisaster);

        expect(result.selfDisaster).toBeDefined();
        expect(result.selfDisaster).toHaveProperty("description", "Office fire");
        expect(result.selfDisaster).toHaveProperty("startDate");
        expect(result.selfDisaster).not.toHaveProperty("id");
    });

    it("should parse claim data with both FEMA and self-declared disasters", () => {
        const dataWithBothDisasters: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            selfDisasterId: "self-1",
            selfDisaster: {
                description: "Office fire",
                startDate: new Date("2024-02-01"),
                endDate: new Date("2024-02-02"),
            },
        };

        const result = restructureClaimDataForPdf(dataWithBothDisasters);

        expect(result.femaDisaster).toBeDefined();
        expect(result.selfDisaster).toBeDefined();
        expect(result.femaDisaster).toHaveProperty("id", "fema-123");
        expect(result.selfDisaster).toHaveProperty("description", "Office fire");
    });

    it("should handle missing email", () => {
        const dataWithoutEmail: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            user: {
                ...baseClaimDataForPDF.user,
                email: undefined,
            },
        };

        const result = restructureClaimDataForPdf(dataWithoutEmail);

        expect(result.user.email).toBeUndefined();
    });

    it("should handle missing FEMA incident dates", () => {
        const dataWithMissingDates: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            femaDisaster: {
                id: "fema-456",
                designatedIncidentTypes: "tornado",
                declarationDate: new Date("2024-03-01"),
                incidentBeginDate: undefined,
                incidentEndDate: undefined,
            },
        };

        const result = restructureClaimDataForPdf(dataWithMissingDates);

        expect(result.femaDisaster).toHaveProperty("incidentBeginDate", undefined);
        expect(result.femaDisaster).toHaveProperty("incidentEndDate", undefined);
    });

    it("should handle multiple claim locations", () => {
        const dataWithMultipleLocations: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            claimLocations: [
                {
                    id: "cloc-1",
                    claimId: "claim-123",
                    locationAddressId: "addr-1",
                    claim: undefined,
                    locationAddress: {
                        id: "addr-1",
                        alias: "Main Office",
                        country: "USA",
                        stateProvince: "MA",
                        city: "Boston",
                        streetAddress: "123 Main St",
                        postalCode: "02101",
                        county: "Suffolk",
                        companyId: "company-456",
                        fipsStateCode: 25,
                        fipsCountyCode: 25025,
                        company: undefined,
                        disasterNotifications: undefined,
                        claimLocations: undefined,
                        lat: 0,
                        long: 0,
                    },
                },
                {
                    id: "cloc-2",
                    claimId: "claim-123",
                    locationAddressId: "addr-2",
                    claim: undefined,
                    locationAddress: {
                        id: "addr-2",
                        alias: "Branch Office",
                        country: "USA",
                        stateProvince: "MA",
                        city: "Cambridge",
                        streetAddress: "456 Oak Ave",
                        postalCode: "02138",
                        county: "Middlesex",
                        companyId: "company-456",
                        fipsStateCode: 25,
                        fipsCountyCode: 25017,
                        company: undefined,
                        disasterNotifications: undefined,
                        claimLocations: undefined,
                        lat: 0,
                        long: 0,
                    },
                },
            ],
        };

        const result = restructureClaimDataForPdf(dataWithMultipleLocations);

        expect(result.impactedLocations).toHaveLength(2);
        expect(result.impactedLocations[0].city).toBe("Boston");
        expect(result.impactedLocations[1].city).toBe("Cambridge");
    });

    it("should handle empty purchase line items", () => {
        const dataWithoutExpenses: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            purchaseLineItems: [],
        };

        const result = restructureClaimDataForPdf(dataWithoutExpenses);

        expect(result.relevantExpenses).toHaveLength(0);
        expect(result.relevantExpenses).toEqual([]);
    });

    it("should handle undefined purchase line items", () => {
        const dataWithoutExpenses: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            purchaseLineItems: undefined,
        };

        const result = restructureClaimDataForPdf(dataWithoutExpenses);

        expect(result.relevantExpenses).toHaveLength(0);
        expect(result.relevantExpenses).toEqual([]);
    });

    it("should throw error when company is missing", () => {
        const dataWithoutCompany: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            company: undefined,
        };

        expect(() => {
            restructureClaimDataForPdf(dataWithoutCompany);
        }).toThrow();
    });

    it("should handle location without county", () => {
        const dataWithoutCounty: ClaimDataForPDF = {
            ...baseClaimDataForPDF,
            claimLocations: [
                {
                    id: "cloc-1",
                    claimId: "claim-123",
                    locationAddressId: "addr-1",
                    claim: undefined,
                    locationAddress: {
                        id: "addr-1",
                        alias: "Main Office",
                        country: "USA",
                        stateProvince: "MA",
                        city: "Boston",
                        streetAddress: "123 Main St",
                        postalCode: "02101",
                        county: undefined,
                        companyId: "company-456",
                        fipsStateCode: 25,
                        fipsCountyCode: 25025,
                        company: undefined,
                        disasterNotifications: undefined,
                        claimLocations: undefined,
                        lat: 0,
                        long: 0,
                    },
                },
            ],
        };

        const result = restructureClaimDataForPdf(dataWithoutCounty);

        expect(result.impactedLocations[0].county).toBeUndefined();
    });

    it("should set dateGenerated to current date", () => {
        const before = new Date();
        const result = restructureClaimDataForPdf(baseClaimDataForPDF);
        const after = new Date();

        expect(result.dateGenerated.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.dateGenerated.getTime()).toBeLessThanOrEqual(after.getTime());
    });
});
