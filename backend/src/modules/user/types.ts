import { z } from "zod";
import { ErrorResponseSchema } from "../../types/Utils";

/* Zod schemas for OpenAPI docs */
//POST
export const CreateUserDTOSchema = z.object({
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    email: z.string().email().optional(),
    companyId: z.string().nullish(),
});

export const CreateUserResponseSchema = z.object({
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
export const GetUserComapnyDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetUserCompanyResponseSchema = z.object({
    companyId: z.string(),
    companyName: z.string(),
});

export const CreateUserAPIResponseSchema = z.union([CreateUserResponseSchema, ErrorResponseSchema]);
export const GetUserAPIResponseSchema = z.union([GetUserResponseSchema, ErrorResponseSchema]);
export const GetUserComapnyAPIResponseSchema = z.union([GetUserCompanyResponseSchema, ErrorResponseSchema]);

/* Zod types for payload validation */
export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type CreateUserAPIResponse = z.infer<typeof CreateUserAPIResponseSchema>;

//GET
export type GetUserDTO = z.infer<typeof GetUserDTOSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
export type GetUserAPIResponse = z.infer<typeof GetUserAPIResponseSchema>;

//GET COMPANY
export type GetUserCompanyDTO = z.infer<typeof GetUserComapnyDTOSchema>;
export type GetUserCompanyResponse = z.infer<typeof GetUserCompanyResponseSchema>;
export type GetUserCompanyAPIResponse = z.infer<typeof GetUserComapnyAPIResponseSchema>;
