import { z } from "zod";

export const ErrorResponseSchema = z.object({
    error: z.string(),
});

export type ContextVariables = {
    userId: string;
    companyId: string;
};
