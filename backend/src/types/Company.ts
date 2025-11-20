import { z } from "zod";
import { CompanyTypesEnum } from "../entities/Company";

export const COMPANY_EXTERNAL_SOURCES = ["quickbooks"] as const;
export type CompanyExternalSource = (typeof COMPANY_EXTERNAL_SOURCES)[number];

/* Zod schemas for OpenAPI docs */
export const CompanyExternalSchema = z.object({
    id: z.string(),
    source: z.string(),
    externalId: z.string(),
    companyId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    importTime: z.string().optional(),
});

export const CompanyExternalOptionalSchema = z.object({
    id: z.string().optional(),
    source: z.string().optional(),
    externalId: z.string().optional(),
    companyId: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    importTime: z.string().optional(),
});

export const CompanySchema = z.object({
    id: z.string(),
    name: z.string().nonempty(),
    businessOwnerFullName: z.string().nonempty(),
    lastQuickBooksInvoiceImportTime: z.string().optional().nullable(),
    lastQuickBooksPurchaseImportTime: z.string().optional().nullable(),
    externals: z.array(CompanyExternalSchema).optional(),
    alternateEmail: z.email().optional(),
    companyType: z.enum(CompanyTypesEnum),
    createdAt: z.string(),
    updatedAt: z.string(),
});

/* Zod schema for POST company */
export const CreateCompanyDTOSchema = z.object({
    name: z.string().min(1),
    businessOwnerFullName: z.string().nonempty(),
    companyType: z.enum(CompanyTypesEnum),
    alternateEmail: z.preprocess((val) => (val === "" ? undefined : val), z.email().optional()),
});

export const CreateCompanyResponseSchema = CompanySchema;

export const GetCompanyExternalResponseSchema = CompanyExternalSchema.nullable();

/* Zod schema for GET company by ID */

export const GetCompanyByIdDTOSchema = z.object({
    id: z.string(),
});

export const GetCompanyExternalDTOSchema = z.object({
    id: z.string(),
});

export const HasCompanyDataDTOSchemaResponse = z.object({
    hasData: z.boolean(),
});

export const GetCompanyByIdResponseSchema = CompanySchema;

export const UpdateQuickBooksImportTimeDTOSchema = CompanyExternalOptionalSchema;

export const UpdateCompanyDTOSchema = z.object({
    name: z.string().min(1).optional(),
    businessOwnerFullName: z.string().optional(),
    alternateEmail: z.email().optional(),
    companyType: z.enum(CompanyTypesEnum).optional(),
});

export const UpdateCompanyResponseSchema = CompanySchema;

/* Zod types for payload validation */
export type CreateCompanyDTO = z.infer<typeof CreateCompanyDTOSchema>;
export type CreateCompanyResponse = z.infer<typeof CreateCompanyResponseSchema>;

export type GetCompanyByIdDTO = z.infer<typeof GetCompanyByIdDTOSchema>;
export type GetCompanyExternalDTO = z.infer<typeof GetCompanyExternalDTOSchema>;
export type GetCompanyByIdResponse = z.infer<typeof GetCompanyByIdResponseSchema>;
export type GetCompanyExternalResponse = z.infer<typeof GetCompanyExternalResponseSchema>;
export type HasCompanyDataDTOResponse = z.infer<typeof HasCompanyDataDTOSchemaResponse>;

export type UpdateQuickBooksImportTimeDTO = z.infer<typeof UpdateQuickBooksImportTimeDTOSchema>;

export type UpdateCompanyDTO = z.infer<typeof UpdateCompanyDTOSchema>;
export type UpdateCompanyResponse = z.infer<typeof UpdateCompanyResponseSchema>;
