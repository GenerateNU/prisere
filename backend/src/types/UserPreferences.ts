import { z } from "zod";

const notificationFrequencies = ['daily', 'weekly']

const UserPreferences = z.object({
    id: z.string(),
    webNotifications: z.boolean(),
    emailNotification: z.boolean(),
    notificationFrequency: z.enum(notificationFrequencies)
})