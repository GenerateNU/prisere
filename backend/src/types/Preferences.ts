import z from "zod";
import { USER_NOTIFICATION_FREQUENCY } from "../entities/UserPreferences";

export const GetUserNotificationPreferencesRequestParams = z.object({
    id: z.uuid(),
});

export const UpdateUserNotificationPreferencesRequestParams = z.object({
    id: z.uuid(),
});

export const GetUserNotificationPreferencesSchema = z.object({
    emailEnabled: z.boolean(),
    webNotificationsEnabled: z.boolean(),
});

export type GetUserNotificationPreferencesResponse = z.infer<typeof GetUserNotificationPreferencesSchema>;

export const UserMissingErrorSchema = z.object({
    error: z.string(),
});

export type UserMissingErrorResponse = z.infer<typeof UserMissingErrorSchema>;

export const UpdateUesrNotificationPreferencesDTOSchema = z.object({
    emailEnabled: z.boolean().optional(),
    webNotificationsEnabled: z.boolean().optional(),
    frequency: z.enum(USER_NOTIFICATION_FREQUENCY).optional(),
});

export type UpdateUesrNotificationPreferencesDTO = z.infer<typeof UpdateUesrNotificationPreferencesDTOSchema>;

export const UpdateUserNotificationPreferencesSchema = z.object({
    emailEnabled: z.boolean(),
    webNotificationsEnabled: z.boolean(),
});

export type UpdateUserNotificationPreferencesResponse = z.infer<typeof UpdateUserNotificationPreferencesSchema>;
