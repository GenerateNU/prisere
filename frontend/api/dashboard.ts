import { BannerData } from "@/types/user";
import { getNotifications } from "./notifications";
import { getClaimInProgress } from "./company";
import { GetClaimInProgressForCompanyResponse } from "@/types/company";

export const getDashboardBannerData = async (): Promise<BannerData> => {
    const disasterNotifications = await getNotifications({
        type: "web",
        page: 1,
        limit: 1,
        status: "unread",
    });
    if (disasterNotifications.length > 0) {
        const disaster = disasterNotifications[0].femaDisaster;
        const claim: GetClaimInProgressForCompanyResponse = await getClaimInProgress();
        if (claim) {
            return { status: "has-claim", disaster, claim };
        } else {
            return { status: "no-claim", disaster };
        }
    }
    return { status: "no-disaster" };
};
