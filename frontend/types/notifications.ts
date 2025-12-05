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

export type UnreadNotificationsResponse =
    paths["/notifications/unread"]["get"]["responses"]["200"]["content"]["application/json"];

export type Notification = paths["/notifications"]["get"]["responses"]["200"]["content"]["application/json"][0];

// Helper type for easier use
export type NotificationFilters = {
    type?: "web" | "email";
    page?: number;
    limit?: number;
    status?: "unread" | "read";
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

export const INCIDENT_MAPPING = {
    "0": "not applicable",
    "1": "an explosion",
    "2": "a straight-line winds",
    "3": "tidal waves",
    "4": "a tropical storm",
    "5": "a winter storm",
    "8": "tropical depression",
    A: "a tsunami",
    B: "a biological disaster",
    C: "a coastal storm",
    D: "a drought",
    E: "an earthquake",
    F: "a flood",
    G: "freezing temperatures",
    H: "a hurricane",
    I: "a terrorist attack",
    J: "a typhoon",
    K: "a dam/devee break",
    L: "a chemical ",
    M: "a mud/landslide",
    N: "a nuclear disaster",
    O: "a severe ice storm",
    P: "fishing losses",
    Q: "crop losses",
    R: "a fire",
    S: "a snowstorm",
    T: "a tornado",
    U: "civil unrest",
    V: "a volcanic eruption",
    W: "a severe storm",
    X: "toxic substances",
    Y: "human cause",
    Z: "other",
} as const;
