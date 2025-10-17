import type { paths } from "../schema";

export type GetNotificationsParams = paths["/notifications"]["get"]["parameters"];

export type GetNotificationsResponse =
    paths["/notifications"]["get"]["responses"]["200"]["content"]["application/json"];

export type MarkReadNotificationResponse =
    paths["/notifications/{id}/markAsRead"]["patch"]["responses"]["200"]["content"]["application/json"];

export type MarkUnreadNotificationResponse =
    paths["/notifications/{id}/markUnread"]["patch"]["responses"]["200"]["content"]["application/json"];

export type MarkAllAsReadResponse =
    paths["/notifications/user/markAllAsRead"]["patch"]["responses"]["200"]["content"]["application/json"];

export type Notification = paths["/notifications"]["get"]["responses"]["200"]["content"]["application/json"][0];
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
};

export type DisasterNotificationWithRealtionsType = {
    id: string;
    userId: string;
    femaDisasterId: string;
    notificationType: "web" | "email";
    notificationStatus: "unread" | "read";
    firstSentAt: Date;
    lastSentAt: Date;
    acknowledgedAt: Date;
    createdAt: Date;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        companyId: string | null;
    };
    femaDisaster: {
        id: string;
        disasterNumber: string;
        fipsStateCode: string;
        declarationDate: string;
        incidentBeginDate: string | null;
        incidentEndDate: string | null;
        fipsCountyCode: string;
        declarationType: string;
        designatedArea: string;
        designatedIncidentTypes: string;
    };
    locationAddress: {
        id: string;
        country: string;
        stateProvince: string;
        city: string;
        streetAddress: string;
        postalCode: string;
        county: string | null;
        companyId: string;
        fipsStateCode: string;
        fipsCountyCode: string;
        company: {
            name: string;
        };
    };
};
