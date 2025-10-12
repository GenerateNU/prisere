import { GetNotificationsResponse, NotificationFilters } from "@/types/notifications";
import { authHeader, authWrapper, client } from "./client";

export const getNotifications = async (
  userId: string,
  filters?: NotificationFilters
): Promise<GetNotificationsResponse> => {
  const req = async (token: string): Promise<GetNotificationsResponse> => {
    const { data, error, response } = await client.GET("/disasterNotification/{id}", {
      params: {
        // path: { id: userId },
        path: { id: "5d3c5843-31d2-4eaf-a290-cf753e9fa32b"},
        query: {
          type: filters?.type,
          page: filters?.page,
          limit: filters?.limit,
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