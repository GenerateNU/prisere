import { z } from "zod";
/* Zod schemas for OpenAPI docs */
const CompanySchema = z.object({
    id: z.string(),
    name: z.string(),
    lastQuickBooksImportTime: z.string().optional(),
});
/* Zod schema for POST company */
export const CreateCompanyDTOSchema = z.object({
    name: z.string().min(1),
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
