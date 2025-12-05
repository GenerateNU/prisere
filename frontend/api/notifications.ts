"use server";
import {
    GetNotificationsResponse,
    MarkAllAsReadResponse,
    MarkReadNotificationResponse,
    NotificationFilters,
    UnreadNotificationsResponse,
} from "@/types/notifications";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const getNotifications = async (
    filters?: NotificationFilters
): Promise<ServerActionResult<GetNotificationsResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<GetNotificationsResponse>> => {
        const client = getClient();
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
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get notifications" };
        }
    };

    return authWrapper<ServerActionResult<GetNotificationsResponse>>()(req);
};

export const updateNotificationStatus = async (
    notificationId: string,
    status: string
): Promise<ServerActionResult<MarkReadNotificationResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<MarkReadNotificationResponse>> => {
        const path = status === "read" ? "/notifications/{id}/markAsRead" : "/notifications/{id}/markUnread";
        const client = getClient();
        const { data, error, response } = await client.PATCH(path, {
            params: {
                path: { id: notificationId },
            },
            headers: authHeader(token),
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update notification status" };
        }
    };

    return authWrapper<ServerActionResult<MarkReadNotificationResponse>>()(req);
};

export const markAllNotificationsAsRead = async (): Promise<ServerActionResult<MarkAllAsReadResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<MarkAllAsReadResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/notifications/user/markAllAsRead", {
            headers: authHeader(token),
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to mark all as read" };
        }
    };

    return authWrapper<ServerActionResult<MarkAllAsReadResponse>>()(req);
};

export const getUserUnreadNotifications = async (): Promise<ServerActionResult<UnreadNotificationsResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UnreadNotificationsResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/notifications/unread", {
            headers: authHeader(token),
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error || "Failed to get user unread notifications" };
        }
    };

    return authWrapper<ServerActionResult<UnreadNotificationsResponse>>()(req);
};
