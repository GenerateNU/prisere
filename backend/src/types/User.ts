import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";

/* Zod schemas for OpenAPI docs */
export const CreateUserDTOSchema = z.object({
    firstName: z.string().min(3).max(20),
    lastName: z.string().min(1),
    email: z.string().email().optional()
});

export const CreateUserResponseSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional()
});

export const CreateUserAPIResponseSchema = z.union([
    CreateUserResponseSchema,
    ErrorResponseSchema
]);

/* Zod types for payload validation */
export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type CreateUserAPIResponse = z.infer<typeof CreateUserAPIResponseSchema>;
