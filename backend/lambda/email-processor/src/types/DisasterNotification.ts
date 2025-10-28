import { z } from "zod";

export const DisasterEmailMessageSchema = z.object({
    to: z.string(),
    from: z.string(),
    subject: z.string(),
    firstName: z.string(),
    declarationDate: z.date(),
    declarationType: z.string(),
    city: z.string().optional(),
    notificationId: z.uuid(),
    disasterId: z.uuid(),
    companyName: z.string().optional(),
});
export type DisasterEmailMessage = z.infer<typeof DisasterEmailMessageSchema>;
