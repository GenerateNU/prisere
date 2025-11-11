import { z } from "zod";

export const ErrorResponseSchema = z.object({
    error: z.string(),
});


export type paginationParams = {
    page: number
    limit: number
}