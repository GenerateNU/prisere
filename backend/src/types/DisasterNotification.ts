import { z } from "zod";

const notificationTypes = ['web', 'email'] as const;
const notificationStatus = ['unread', 'read', 'acknowledged'] as const;

export const DisasterNotification = z.object({
    id: z.string(),
    userId: z.string(),
    disasterId: z.string(),
    notificationType: z.enum(notificationTypes),
    notificationStatus: z.enum(notificationStatus),
    firstSentAt: z.coerce.date(),
    lastSentAt: z.coerce.date(),
    acknowledgedAt: z.coerce.date()
});

export type DisasterNotificationType = z.infer<typeof DisasterNotification>;

// GET /api/notifications/{user-id}
export const GetUsersDisasterNotificationsResponseSchema = z.array(DisasterNotification);
export type GetUsersDisasterNotificationsResponse = DisasterNotificationType[];
// for GET request payload validation:
export const GetUsersDisasterNotificationsDTOSchema = z.object({
    id: z.string()
});
export type GetUsersDisasterNotificationsDTO = z.infer<typeof GetUsersDisasterNotificationsDTOSchema>;


// POST /api/notifications/{id}/acknowledge
export const AcknowledgeNotificationResponseSchema = DisasterNotification;
export type AcknowledgeNotificationResponse = DisasterNotificationType;

// POST /api/notifications/{id}/dismiss
export const DismissNotificationResponseSchema = DisasterNotification;
export type DismissNotificationResponse = DisasterNotificationType;

// POST /api/notifications
export const BulkCreateNotificationsRequestSchema = z.array(
    z.object({
        userId: z.string(),
        disasterId: z.string(),
        notificationType: z.enum(notificationTypes),
        // Optionally add other fields needed for creation
    })
);
export type BulkCreateNotificationsRequest = z.infer<typeof BulkCreateNotificationsRequestSchema>;

export const BulkCreateNotificationsResponseSchema = z.array(DisasterNotification);
export type BulkCreateNotificationsResponse = DisasterNotificationType[];

// DELETE /api/notifications/{id}
export const DeleteNotificationResponseSchema = z.object({
    success: z.boolean(),
    deletedId: z.string()
});
export type DeleteNotificationResponse = z.infer<typeof DeleteNotificationResponseSchema>;