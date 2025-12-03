import {
    ClaimData,
    ClaimDataForPDF,
    CompanyInfoSchema,
    FemaDisasterInfoSchema,
    ImpactedLocation,
    ImpactedLocationSchema,
    RelevantExpenseSchema,
    SelfDisasterInfoSchema,
    UserInfoSchema,
} from "../types";
import { ClaimLocation } from "../../../entities/ClaimLocation";
import { PurchaseLineItem } from "../../../entities/PurchaseLineItem";
import { InsurancePolicy } from "../../../entities/InsurancePolicy";

export function restructureClaimDataForPdf({
    averageIncome,
    claimLocations,
    company,
    femaDisaster,
    purchaseLineItems,
    selfDisaster,
    user,
    pastRevenues,
    pastPurchases,
    insuranceInfo,
}: ClaimDataForPDF): ClaimData {
    return {
        user: UserInfoSchema.parse(user),
        company: CompanyInfoSchema.parse(company),
        femaDisaster: femaDisaster ? FemaDisasterInfoSchema.parse(femaDisaster) : undefined,
        selfDisaster: selfDisaster ? SelfDisasterInfoSchema.parse(selfDisaster) : undefined,
        impactedLocations: parseImpactedLocations(claimLocations),
        relevantExpenses: parseRelevantExpenses(purchaseLineItems),
        averageIncome: averageIncome,
        dateGenerated: new Date(),
        pastRevenues: pastRevenues,
        pastPurchases: pastPurchases,
        insuranceInfo: insuranceInfo ? parseInsuranceInfo(insuranceInfo) : undefined,
    };
}

function parseImpactedLocations(claimLocations?: ClaimLocation[]): ImpactedLocation[] {
    if (!claimLocations || claimLocations.length === 0) {
        return [];
    }

    const addresses = claimLocations.filter(Boolean).map((claimLoc) => claimLoc.locationAddress);

    return addresses.filter((item) => item !== undefined).map((a) => ImpactedLocationSchema.parse(a));
}

function parseRelevantExpenses(purchaseLineItems?: PurchaseLineItem[]) {
    if (!purchaseLineItems || purchaseLineItems.length === 0) {
        return [];
    }

    return purchaseLineItems.map((li) => RelevantExpenseSchema.parse(
        {
            ...li,
            quickbooksDateCreated: li.quickbooksDateCreated?.toISOString(),
            dateCreated: li.dateCreated.toISOString(),
        }
    ));
}

function parseInsuranceInfo(info: InsurancePolicy) {
    return {
        id: info.id,
        policyName: info.policyName,
        policyHolderFirstName: info.policyHolderFirstName,
        policyHolderLastName: info.policyHolderLastName,
        insuranceCompanyName: info.insuranceCompanyName,
        policyNumber: info.policyNumber,
        insuranceType: info.insuranceType,
        updatedAt: info.updatedAt.toISOString(),
        createdAt: info.createdAt.toISOString(),
    };
}
