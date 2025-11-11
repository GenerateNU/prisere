"use server";
import { getDisastersAffectingUser } from "./user";
import { getClaims } from "./claim";
import { BannerData } from "@/types/user";

export const getDashboardBannerData = async (): Promise<BannerData> => {
    const companyDisasterPairs = await getDisastersAffectingUser();
    if (companyDisasterPairs && companyDisasterPairs.length > 0) {
        const disaster = companyDisasterPairs[0].disaster;
        const company = companyDisasterPairs[0].company;
        const claim = await getClaims({ companyId: company.id });
        console.log(claim)
        if (claim.length > 0) {
            return { status: "has-claim", disaster, claim };
        } else {
            return { status: "no-claim", disaster };
        }
    } else {
        return { status: "no-disaster" };
    }
};