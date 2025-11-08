import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";
import { FemaDisasterSchema } from "./fema-disaster";
import { CompanySchema } from "./Company";

/* Zod schemas for OpenAPI docs */
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
export const GetUsercompanyDTOSchema = z.object({
    id: z.string().nonempty(),
});
export const GetDisastersAffectingUserDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetUserCompanyResponseSchema = z.object({
    companyId: z.string(),
    companyName: z.string(),
});
export const GetDisastersAffectingUserResponseSchema = z.array(
    z.object({
        company: CompanySchema,
        disaster: FemaDisasterSchema,
    })
);
export const CreateUserAPIResponseSchema = z.union([CreateUserResponseSchema, ErrorResponseSchema]);

/* Zod types for payload validation */
export type CreartUserRequest = z.infer<typeof createUserRequestBody>;
export type CreateUserDTO = z.infer<typeof CreateUserDTOSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type CreateUserAPIResponse = z.infer<typeof CreateUserAPIResponseSchema>;

//GET
export type GetUserDTO = z.infer<typeof GetUserDTOSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

//GET COMPANY
export type GetUserCompanyDTO = z.infer<typeof GetUsercompanyDTOSchema>;
export type GetDisastersAffectingUserDTO = z.infer<typeof GetDisastersAffectingUserDTOSchema>;
export type GetUserCompanyResponse = z.infer<typeof GetUserCompanyResponseSchema>;
export type GetDisastersAffectingUseResponse = z.infer<typeof GetDisastersAffectingUserResponseSchema>;
