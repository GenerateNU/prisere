import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";

/* Zod schemas for OpenAPI docs */
export const UserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email().optional().nullable(),
    companyId: z.string().optional().nullable(),
});

//POST
export const createUserRequestBody = z.object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    email: z.string().email().optional(),
    companyId: z.string().nullish(),
});

export const CreateUserDTOSchema = z.object({
    id: z.uuid(),
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    email: z.email().optional(),
    companyId: z.string().nullish(),
});

export const CreateUpdateUserResponseSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional(),
    companyId: z.string().nullish(),
});

//GET
export const GetUserDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetUserResponseSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional(),
});

//GET COMPANY
export const GetUsercompanyDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetUserCompanyResponseSchema = z.object({
    companyId: z.string(),
    companyName: z.string(),
});
export const CreateUserAPIResponseSchema = z.union([CreateUpdateUserResponseSchema, ErrorResponseSchema]);

//PATCH

export const UpdateUserRequestBodySchema = z.object({
    firstName: z.string().nonempty().optional(),
    lastName: z.string().nonempty().optional(),
    email: z.email().optional(),
});

export const UpdateUserDTOSchema = UpdateUserRequestBodySchema.extend({
    id: z.string().nonempty(),
});

/* Zod types for payload validation */
export type CreartUserRequest = z.infer<typeof createUserRequestBody>;
export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
export type CreateUserResponse = z.infer<typeof CreateUpdateUserResponseSchema>;
export type CreateUserAPIResponse = z.infer<typeof CreateUserAPIResponseSchema>;

//PATCH
export type UpdateUserRequest = z.infer<typeof UpdateUserDTOSchema>;
export type UpdateUserResponse = z.infer<typeof CreateUpdateUserResponseSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTOSchema>;

//GET
export type GetUserDTO = z.infer<typeof GetUserDTOSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

//GET COMPANY
export type GetUserCompanyDTO = z.infer<typeof GetUsercompanyDTOSchema>;
export type GetUserCompanyResponse = z.infer<typeof GetUserCompanyResponseSchema>;
