import { z } from "zod";

/* Zod schemas for OpenAPI docs */
export const CompanyExternalSchema = z.object({
    id: z.string(),
    source: z.string(),
    externalId: z.string(),
    companyId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const CompanySchema = z.object({
    id: z.string(),
    name: z.string().nonempty(),
    businessOwnerFullName: z.string().nonempty(),
    lastQuickBooksInvoiceImportTime: z.string().optional().nullable(),
    lastQuickBooksPurchaseImportTime: z.string().optional().nullable(),
    externals: z.array(CompanyExternalSchema).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

/* Zod schema for POST company */
export const CreateCompanyDTOSchema = z.object({
    name: z.string().min(1),
    businessOwnerFullName: z.string().nonempty(),
});

export const CreateCompanyResponseSchema = CompanySchema;

/* Zod schema for GET company by ID */

export const GetCompanyByIdDTOSchema = z.object({
    id: z.string(),
});

export const GetCompanyByIdResponseSchema = CompanySchema;

export const UpdateQuickBooksImportTimeDTOSchema = z.object({
    companyId: z.string(),
    importTime: z.date(),
});

/* Zod types for payload validation */
export type CreateCompanyDTO = z.infer<typeof CreateCompanyDTOSchema>;
export type CreateCompanyResponse = z.infer<typeof CreateCompanyResponseSchema>;

export type GetCompanyByIdDTO = z.infer<typeof GetCompanyByIdDTOSchema>;
export type GetCompanyByIdResponse = z.infer<typeof GetCompanyByIdResponseSchema>;

export type UpdateQuickBooksImportTimeDTO = z.infer<typeof UpdateQuickBooksImportTimeDTOSchema>;
