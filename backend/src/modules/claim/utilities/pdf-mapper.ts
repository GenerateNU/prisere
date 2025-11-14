import {
    ClaimData,
    ClaimDataForPDF,
    FemaDisasterInfoSchema,
    ImpactedLocation,
    ImpactedLocationSchema,
    RelevantExpenseSchema,
    SelfDisasterInfoSchema,
    UserInfoSchema,
} from "../types";
import { ClaimLocation } from "../../../entities/ClaimLocation";
import { PurchaseLineItem } from "../../../entities/PurchaseLineItem";

export function restructureClaimDataForPdf({
    averageIncome,
    claimLocations,
    company,
    femaDisaster,
    purchaseLineItems,
    selfDisaster,
    user,
}: ClaimDataForPDF): ClaimData {
    return {
        user: UserInfoSchema.parse(user),
        company: { name: company!.name },
        femaDisaster: femaDisaster ? FemaDisasterInfoSchema.parse(femaDisaster) : undefined,
        selfDisaster: selfDisaster ? SelfDisasterInfoSchema.parse(selfDisaster) : undefined,
        impactedLocations: parseImpactedLocations(claimLocations),
        relevantExpenses: parseRelevantExpenses(purchaseLineItems),
        averageIncome: averageIncome,
        dateGenerated: new Date(),
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

    return purchaseLineItems.map((li) => RelevantExpenseSchema.parse(li));
}
