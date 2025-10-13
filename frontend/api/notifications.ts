import { MarkReadNotificationResponse, GetNotificationsResponse, NotificationFilters, MarkAllAsReadResponse } from "@/types/notifications";
import { authHeader, authWrapper, client } from "./client";

export const getNotifications = async (
  userId: string,
  filters?: NotificationFilters
): Promise<GetNotificationsResponse> => {
  const req = async (token: string): Promise<GetNotificationsResponse> => {
    const { data, error, response } = await client.GET("/disasterNotification/{id}", {
      params: {
        path: { id: userId },
        query: {
          type: "web",
          page: filters?.page,
          limit: filters?.limit,
          status: filters?.status
        },
      },
      headers: authHeader(token),
    });

    if (response.ok) {
      return data!;
    } else {
      throw Error(error?.error);
    }
  };

  return authWrapper<GetNotificationsResponse>()(req);
};

export const updateNotificationStatus = async (
    notificationId: string,
    status: string
): Promise<MarkReadNotificationResponse> => {
    const req = async (token: string): Promise<MarkReadNotificationResponse> => {
    const path = status == 'read' ? "/disasterNotification/{id}/markAsRead" : "/disasterNotification/{id}/markUnread"
    const { data, error, response } = await client.PATCH(path, {
      params: {
        path: { id: notificationId }
      },
      headers: authHeader(token),
    });

    if (response.ok) {
      return data!;
    } else {
      throw Error(error?.error);
    }
  };

  return authWrapper<MarkReadNotificationResponse>()(req);
}

export const markAllNotificationsAsRead = async (
    userId: string
): Promise<MarkAllAsReadResponse> => {
    const req = async (token: string): Promise<MarkAllAsReadResponse> => {
        const { data, error, response } = await client.PATCH("/disasterNotification/user/{id}/markAllAsRead", {
            params: {
                path: { id: userId },
            },
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
