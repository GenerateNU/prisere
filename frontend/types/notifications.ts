import type { paths } from "../schema";

export type GetNotificationsParams =
  paths["/notifications"]["get"]["parameters"];

export type GetNotificationsResponse =
  paths["/notifications"]["get"]["responses"]["200"]["content"]["application/json"];

export type MarkReadNotificationResponse =
  paths["/notifications/{id}/markAsRead"]["patch"]["responses"]["200"]["content"]["application/json"];

export type MarkUnreadNotificationResponse =
  paths["/notifications/{id}/markUnread"]["patch"]["responses"]["200"]["content"]["application/json"];

// Helper type for easier use
export type NotificationFilters = {
  type?: "web" | "email";
  page?: number;
  limit?: number;
  status?: "unread" | "read" | "acknowledged";
};

export type PaginationStatus = {
    currentPage: number;
    itemsPerPage: number;
}