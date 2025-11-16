import { z } from "zod";
import { CreateUpdateUserResponseSchema } from "../types/User";
import { LocationAddressSchemaType } from "./Location";
import { FIPSCounty, FIPSState, incidentTypeString } from "./fema-disaster";

const _notificationTypes = ["web", "email"] as const;
const notificationStatus = ["unread", "read"] as const;

export const DisasterNotification = z.object({
    id: z.string(),
    userId: z.string(),
    femaDisasterId: z.string(),
    isWeb: z.boolean(),
    isEmail: z.boolean(),
    notificationStatus: z.enum(notificationStatus).optional().nullable(),
    firstSentAt: z.union([z.date(), z.string()]).optional().nullable(),
    lastSentAt: z.union([z.date(), z.string()]).optional().nullable(),
    acknowledgedAt: z.union([z.date(), z.string()]).optional().nullable(),
    createdAt: z.union([z.date(), z.string()]),
});

export const DisasterNotificationWithRelations = z.object({
    id: z.string(),
    userId: z.string(),
    femaDisasterId: z.string(),
    isWeb: z.boolean(),
    isEmail: z.boolean(),
    notificationStatus: z.enum(notificationStatus),
    firstSentAt: z.union([z.date(), z.string()]).optional().nullable(),
    lastSentAt: z.union([z.date(), z.string()]).optional().nullable(),
    acknowledgedAt: z.union([z.date(), z.string()]).optional().nullable(),
    createdAt: z.union([z.date(), z.string()]),
    user: CreateUpdateUserResponseSchema,
    femaDisaster: z.object({
        id: z.uuid(),
        disasterNumber: z.number(),
        fipsStateCode: FIPSState,
        declarationDate: z.iso.datetime(),
        incidentBeginDate: z.string().nullable(),
        incidentEndDate: z.string().nullable(),
        fipsCountyCode: FIPSCounty,
        declarationType: z.string().length(2),
        designatedArea: z.string(),
        designatedIncidentTypes: incidentTypeString,
    }),
    locationAddress: LocationAddressSchemaType,
});

export type DisasterNotificationType = z.infer<typeof DisasterNotification>;
export type DisasterNotificationWithRealtionsType = z.infer<typeof DisasterNotificationWithRelations>;

export type NotificationTypeFilter = z.infer<typeof _notificationTypes>;

// GET /api/notifications/{user-id}
export const GetUsersDisasterNotificationsResponseSchema = z.array(DisasterNotificationWithRelations);
export type GetUsersDisasterNotificationsResponse = DisasterNotificationType[] | { error: string };
// for GET request payload validation:
export const GetUsersDisasterNotificationsDTOSchema = z.object({
    id: z.string(),
});
export type GetUsersDisasterNotificationsDTO = z.infer<typeof GetUsersDisasterNotificationsDTOSchema>;

// POST /api/notifications/{id}/acknowledge
export const MarkReadNotificationResponseSchema = DisasterNotification;
export type MarkReadNotificationResponse = DisasterNotificationType;

// POST /api/notifications/{id}/dismiss
export const DismissNotificationResponseSchema = DisasterNotification;
export type DismissNotificationResponse = z.infer<typeof DismissNotificationResponseSchema>;

// POST /api/notifications
export const BulkCreateNotificationsRequestSchema = z.array(
    z.object({
        userId: z.string(),
        femaDisasterId: z.string(),
        isWeb: z.boolean().optional().default(true),
        isEmail: z.boolean().optional().default(true),
        // Only created with these 3 attributes set, rest start null
    })
);
export type BulkCreateNotificationsRequest = z.infer<typeof BulkCreateNotificationsRequestSchema>;

export const BulkCreateNotificationsResponseSchema = z.array(DisasterNotification);
export type BulkCreateNotificationsResponse = DisasterNotificationType[];

// DELETE /api/notifications/{id}
export const DeleteNotificationResponseSchema = z.object({
    success: z.boolean(),
    deletedId: z.string(),
});
export type DeleteNotificationResponse = z.infer<typeof DeleteNotificationResponseSchema>;

// Mark all notifications as read
export const MarkAllAsReadResponseSchema = z.object({
    success: z.boolean(),
    updatedCount: z.number(),
});

export type MarkAllAsReadResponse = z.infer<typeof MarkAllAsReadResponseSchema>;

export const DisasterEmailMessageSchema = z.object({
    to: z.string(),
    alt: z.string().optional(),
    from: z.string(),
    subject: z.string(),
    firstName: z.string(),
    declarationDate: z.date(),
    declarationType: z.string(),
    declarationTypeMeaning: z.string(),
    incidentTypes: z.string(),
    incidentTypeMeanings: z.array(z.string()),
    city: z.string().optional(),
    notificationId: z.uuid(),
    disasterId: z.uuid(),
    companyName: z.string().optional(),
});
export type DisasterEmailMessage = z.infer<typeof DisasterEmailMessageSchema>;
