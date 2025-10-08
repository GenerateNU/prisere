import { z } from "zod";

export const ErrorResponseSchema = z.object({
    error: z.string(),
});

export function openApiErrorCodes(description: string) {
    return {
        400: {
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
            description,
        },
        500: {
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
            description,
        },
    };
}
