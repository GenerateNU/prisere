"use server";
import { BannerData } from "@/types/user";
import { getNotifications } from "./notifications";
import { getClaimInProgress } from "./company";
import { ServerActionResult, isServerActionError } from "./types";

export const getDashboardBannerData = async (): Promise<ServerActionResult<BannerData>> => {
    const notificationsResult = await getNotifications({
        type: "web",
        page: 1,
        limit: 1,
        status: "unread",
    });

    if (isServerActionError(notificationsResult)) {
        return { success: false, error: notificationsResult.error };
    }

    const disasterNotifications = notificationsResult.data;

    if (disasterNotifications.length > 0) {
        const disaster = disasterNotifications[0].femaDisaster;
        const claimResult = await getClaimInProgress();

        if (isServerActionError(claimResult)) {
            return { success: false, error: claimResult.error };
        }

        const claim = claimResult.data;

        if (claim) {
            return { success: true, data: { status: "has-claim", disaster, claim } };
        } else {
            return { success: true, data: { status: "no-claim", disaster } };
        }
    }
    return { success: true, data: { status: "no-disaster" } };
};
