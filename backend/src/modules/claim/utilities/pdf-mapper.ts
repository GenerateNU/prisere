import {
    ClaimData,
    ClaimDataForPDF,
    FemaDisasterInfo,
    FemaDisasterInfoSchema,
    ImpactedLocation,
    ImpactedLocationSchema,
    RelevantExpenseSchema,
    SelfDisasterInfo,
    SelfDisasterInfoSchema,
    UserInfoSchema,
} from "../types";
import { ClaimLocation } from "../../../entities/ClaimLocation";

export function restructureClaimDataForPdf(data: ClaimDataForPDF): ClaimData {
    return {
        user: UserInfoSchema.parse(data.user),
        company: { name: data.company!.name },
        disaster: parseDisasterInfo(data.femaDisaster, data.selfDisaster),
        // not sure what to do if claim locations is undef?? throws error rn
        impactedLocations: parseImpactedLocations(data.claimLocations),
        relevantExpenses: data.purchaseLineItems
            ? data.purchaseLineItems.map((li) => RelevantExpenseSchema.parse(li))
            : [],
        averageIncome: data.averageIncome,
        dateGenerated: new Date(),
    };
}

function parseImpactedLocations(claimLocations?: ClaimLocation[]): ImpactedLocation[] {
    if (!claimLocations || claimLocations.length === 0) {
        throw new Error("No associated claim locations that were affected");
    }

    const addresses = claimLocations.filter(Boolean).map((claimLoc) => claimLoc.locationAddress);

    return addresses.filter((item) => item !== undefined).map((a) => ImpactedLocationSchema.parse(a));
}

function parseDisasterInfo(femaDisaster?: FemaDisasterInfo, selfDisaster?: SelfDisasterInfo) {
    type BothDisasters = FemaDisasterInfo | SelfDisasterInfo;
    const result: BothDisasters[] = [];
    if (femaDisaster) {
        const fema = FemaDisasterInfoSchema.parse(femaDisaster);
        result.push(fema);
    }
    if (selfDisaster) {
        const self = SelfDisasterInfoSchema.parse(selfDisaster);
        result.push(self);
    }
    return result;
}
