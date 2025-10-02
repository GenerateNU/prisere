import { z } from "zod";
import { ErrorResponseSchema } from "../../types/Utils";

//Create a new quick books purchase
export const CreateQuickBooksPurchaseDTOSchema = z.object({
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean().optional().default(false),
});

export const CreateQuickBooksPurchaseResponseSchema = z.object({
    id: z.string(),
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
});

//Patch existing quick books purchase
export const PatchQuickBooksPurchaseDTOSchema = z.object({
    quickBooksID: z.number().optional(),
    totalAmountCents: z.number().optional(),
    isRefund: z.boolean().optional(),
});

export const PatchQuickBooksPurchasesResponseSchema = z.object({
    id: z.string(),
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
    dateCreated: z.date(),
});

//Get a purchase given its ID

//Empty DTO

export const GetQuickBooksPurchasesResponseSchema = z.object({
    id: z.string(),
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
    dateCreated: z.date(),
    lastUpdated: z.date(),
});

//Get a list of purchases given the company ID
export const GetCompanyQuickBooksPurchasesDTOSchema = z.object({
    companyId: z.number(), //This is bad
    pageNumber: z.number().optional().default(0),
    resultsPerPage: z.number().optional().default(20),
});

export const GetCompanyQuickBooksPurchasesResponseSchema = z.array(
    z.object({
        id: z.string(),
        comapnyId: z.string(),
        quickBooksID: z.number(),
        totalAmountCents: z.number(),
        isRefund: z.boolean(),
        dateCreated: z.date(),
    })
);

//Controller Responses
export type CreateQuickBooksPurchaseResponse = z.infer<typeof CreateQuickBooksPurchaseResponseSchema>;
export type PatchQuickBooksPurchasesResponse = z.infer<typeof PatchQuickBooksPurchasesResponseSchema>;
export type GetQuickBooksPurchaseResponse = z.infer<typeof GetQuickBooksPurchasesResponseSchema>;
export type GetCompanyQuickBooksPurchasesResponse = z.infer<typeof GetCompanyQuickBooksPurchasesResponseSchema>;

//API Response Schemas
export const CreateQuickBooksPurchaseAPIResponseSchema = z.union([
    CreateQuickBooksPurchaseResponseSchema,
    ErrorResponseSchema,
]);

export const PathQuickBooksPurchaseAPIResponseSchema = z.union([
    PatchQuickBooksPurchasesResponseSchema,
    ErrorResponseSchema,
]);

export const GetQuickBooksPurchaseAPIResponseSchema = z.union([
    GetQuickBooksPurchasesResponseSchema,
    ErrorResponseSchema,
]);

export const GetCompanyQuickBooksPurchaseAPIResponseSchema = z.union([
    GetCompanyQuickBooksPurchasesResponseSchema,
    ErrorResponseSchema,
]);

//Input types
export type CreateQuickBooksPurchaseDTO = z.infer<typeof CreateQuickBooksPurchaseDTOSchema>;
export type PatchQuickBooksPurchaseDTO = z.infer<typeof PatchQuickBooksPurchaseDTOSchema>;
export type GetCompanyQuickBooksPurchasesDTO = z.infer<typeof GetCompanyQuickBooksPurchasesDTOSchema>;

//Zod types for payload validation
export type CreateQuickBooksPurchaseAPIResponse = z.infer<typeof CreateQuickBooksPurchaseDTOSchema>;
export type PatchQuickBooksPurchaseAPIResponse = z.infer<typeof PathQuickBooksPurchaseAPIResponseSchema>;
export type GetQuickBooksPurchaseAPIResponse = z.infer<typeof GetQuickBooksPurchaseAPIResponseSchema>;
export type GetCompanyQuickBooksPurchasesAPIResponse = z.infer<typeof GetCompanyQuickBooksPurchaseAPIResponseSchema>;
