import type { paths } from "../schema";

export type GetNotificationsParams =
  paths["/disasterNotification/{id}"]["get"]["parameters"];

export type GetNotificationsResponse =
  paths["/disasterNotification/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type MarkReadNotificationResponse =
  paths["/disasterNotification/{id}/markAsRead"]["patch"]["responses"]["200"]["content"]["application/json"];

export type MarkUnreadNotificationResponse =
  paths["/disasterNotification/{id}/markUnread"]["patch"]["responses"]["200"]["content"]["application/json"];

// Helper type for easier use
export type NotificationFilters = {
  type?: "web" | "email";
  page?: number;
  limit?: number;
  status?: "unread" | "read" | "acknowledged";
};