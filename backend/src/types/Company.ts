import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";

/* Zod schemas for OpenAPI docs */

const CompanySchema = z.object({
    id: z.string(),
    name: z.string(),
    // convert string to Date if needed
    lastQuickBooksImportTime: z.string().optional(),
});

/* Zod schema for POST company */
export const CreateCompanyDTOSchema = z.object({
    name: z.string().min(1),
});

export const CreateCompanyResponseSchema = CompanySchema;

export const CreateCompanyAPIResponseSchema = z.union([CreateCompanyResponseSchema, ErrorResponseSchema]);

/* Zod schema for GET company by ID */

export const GetCompanyByIdDTOSchema = z.object({
    id: z.string(),
});

export const GetCompanyByIdResponseSchema = CompanySchema;

export const GetCompanyByIdAPIResponseSchema = z.union([GetCompanyByIdResponseSchema, ErrorResponseSchema]);

export const UpdateQuickBooksImportTimeDTOSchema = z.object({
    companyId: z.string(),
    importTime: z.date(),
});

/* Zod types for payload validation */
export type CreateCompanyDTO = z.infer<typeof CreateCompanyDTOSchema>;
export type CreateCompanyResponse = z.infer<typeof CreateCompanyResponseSchema>;
export type CreateCompanyAPIResponse = z.infer<typeof CreateCompanyAPIResponseSchema>;

export type GetCompanyByIdDTO = z.infer<typeof GetCompanyByIdDTOSchema>;
export type GetCompanyByIdResponse = z.infer<typeof GetCompanyByIdResponseSchema>;
export type GetCompanyByIdAPIResponse = z.infer<typeof GetCompanyByIdAPIResponseSchema>;

export type UpdateQuickBooksImportTimeDTO = z.infer<typeof UpdateQuickBooksImportTimeDTOSchema>;
