import { z } from "zod";
import { ErrorResponseSchema } from "../../types/Utils";

//Create a new quick books purchase
export const CreatePurchaseDTOSchema = z.object({
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean().optional().default(false),
});

export const CreatePurchaseResponseSchema = z.object({
    id: z.string(),
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
});

//Patch existing quick books purchase
export const PatchPurchaseDTOSchema = z.object({
    quickBooksID: z.number().optional(),
    totalAmountCents: z.number().optional(),
    isRefund: z.boolean().optional(),
});

export const PatchPurchasesResponseSchema = z.object({
    id: z.string(),
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
    dateCreated: z.date(),
});

//Get a purchase given its ID

//Empty DTO

export const GetPurchasesResponseSchema = z.object({
    id: z.string(),
    comapnyId: z.string(),
    quickBooksID: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
    dateCreated: z.date(),
    lastUpdated: z.date(),
});

//Get a list of purchases given the company ID
export const GetCompanyPurchasesDTOSchema = z.object({
    companyId: z.number(), //This is bad
    pageNumber: z.number().optional().default(0),
    resultsPerPage: z.number().optional().default(20),
});

export const GetCompanyPurchasesResponseSchema = z.array(
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
export type CreatePurchaseResponse = z.infer<typeof CreatePurchaseResponseSchema>;
export type PatchPurchasesResponse = z.infer<typeof PatchPurchasesResponseSchema>;
export type GetPurchaseResponse = z.infer<typeof GetPurchasesResponseSchema>;
export type GetCompanyPurchasesResponse = z.infer<typeof GetCompanyPurchasesResponseSchema>;

//API Response Schemas
export const CreatePurchaseAPIResponseSchema = z.union([CreatePurchaseResponseSchema, ErrorResponseSchema]);

export const PathPurchaseAPIResponseSchema = z.union([PatchPurchasesResponseSchema, ErrorResponseSchema]);

export const GetPurchaseAPIResponseSchema = z.union([GetPurchasesResponseSchema, ErrorResponseSchema]);

export const GetCompanyPurchaseAPIResponseSchema = z.union([GetCompanyPurchasesResponseSchema, ErrorResponseSchema]);

//Input types
export type CreatePurchaseDTO = z.infer<typeof CreatePurchaseDTOSchema>;
export type PatchPurchaseDTO = z.infer<typeof PatchPurchaseDTOSchema>;
export type GetCompanyPurchasesDTO = z.infer<typeof GetCompanyPurchasesDTOSchema>;

//Zod types for payload validation
export type CreatePurchaseAPIResponse = z.infer<typeof CreatePurchaseDTOSchema>;
export type PatchPurchaseAPIResponse = z.infer<typeof PathPurchaseAPIResponseSchema>;
export type GetPurchaseAPIResponse = z.infer<typeof GetPurchaseAPIResponseSchema>;
export type GetCompanyPurchasesAPIResponse = z.infer<typeof GetCompanyPurchaseAPIResponseSchema>;
