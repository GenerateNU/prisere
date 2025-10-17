import { MarkReadNotificationResponse, GetNotificationsResponse, NotificationFilters } from "@/types/notifications";
import { authHeader, authWrapper, client } from "./client";
import { MarkAllAsReadResponse } from "@/types/notifications";

export const getNotifications = async (filters?: NotificationFilters): Promise<GetNotificationsResponse> => {
    const req = async (token: string): Promise<GetNotificationsResponse> => {
        const { data, error, response } = await client.GET("/notifications", {
            params: {
                query: {
                    type: filters?.type || "web",
                    page: filters?.page ? String(filters.page) : undefined,
                    limit: filters?.limit ? String(filters.limit) : undefined,
                    status: filters?.status,
                },
            },
            headers: authHeader(token),
        });

        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error || "Failed to get notifications");
        }
    };

    return authWrapper<GetNotificationsResponse>()(req);
};

export const updateNotificationStatus = async (
    notificationId: string,
    status: string
): Promise<MarkReadNotificationResponse> => {
    const req = async (token: string): Promise<MarkReadNotificationResponse> => {
        const path = status === "read" ? "/notifications/{id}/markAsRead" : "/notifications/{id}/markUnread";
        const { data, error, response } = await client.PATCH(path, {
            params: {
                path: { id: notificationId },
            },
            headers: authHeader(token),
        });

        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error || "Failed to update notification status");
        }
    };

    return authWrapper<MarkReadNotificationResponse>()(req);
};

export const markAllNotificationsAsRead = async (): Promise<MarkAllAsReadResponse> => {
    const req = async (token: string): Promise<MarkAllAsReadResponse> => {
        const { data, error, response } = await client.PATCH("/notifications/user/markAllAsRead", {
            headers: authHeader(token),
        });

        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error || "Failed to mark all as read");
        }
    };

    return authWrapper<MarkAllAsReadResponse>()(req);
};
