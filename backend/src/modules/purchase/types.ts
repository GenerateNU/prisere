import { z } from "zod";
import { ErrorResponseSchema } from "../../types/Utils";

//Create a new quick books purchase
export const CreatePurchaseDTOSchema = z.object({
    companyId: z.string().nonempty(),
    quickBooksId: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean().optional().default(false),
});

//Patch existing quick books purchase
export const PatchPurchaseDTOSchema = z.object({
    purchaseId: z.string().nonempty(),
    quickBooksId: z.number().optional(),
    totalAmountCents: z.number().optional(),
    isRefund: z.boolean().optional(),
});

export const createOrPatchPurchasesResponseSchema = z.object({
    id: z.string().nonempty(),
    companyId: z.string().nonempty(),
    quickBooksId: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
    dateCreated: z.date(),
});

export const CreateOrPatchPurchaseDTOUnionSchema = z.union([CreatePurchaseDTOSchema, PatchPurchaseDTOSchema]);

export const GetPurchasesResponseSchema = z.object({
    id: z.string().nonempty(),
    companyId: z.string().nonempty(),
    quickBooksId: z.number(),
    totalAmountCents: z.number(),
    isRefund: z.boolean(),
    dateCreated: z.date(),
    lastUpdated: z.date(),
});

//Get a list of purchases given the company ID
export const GetCompanyPurchasesDTOSchema = z.object({
    companyId: z.string().nonempty(), //This is bad
    pageNumber: z.number().gte(0).optional().default(0),
    resultsPerPage: z.number().gt(0).optional().default(20),
});

export const GetCompanyPurchasesResponseSchema = z.array(
    z.object({
        id: z.string().nonempty(),
        companyId: z.string().nonempty(),
        quickBooksID: z.number().optional(),
        totalAmountCents: z.number(),
        isRefund: z.boolean(),
        dateCreated: z.date(),
    })
);

//Controller Responses
export type CreateOrPatchPurchaseResponse = z.infer<typeof createOrPatchPurchasesResponseSchema>;
export type GetPurchaseResponse = z.infer<typeof GetPurchasesResponseSchema>;
export type GetCompanyPurchasesResponse = z.infer<typeof GetCompanyPurchasesResponseSchema>;

//API Response Schemas
export const CreateOrPatchPurchaseAPIResponseSchema = z.union([
    createOrPatchPurchasesResponseSchema,
    ErrorResponseSchema,
]);

export const GetPurchaseAPIResponseSchema = z.union([GetPurchasesResponseSchema, ErrorResponseSchema]);

export const GetCompanyPurchaseAPIResponseSchema = z.union([GetCompanyPurchasesResponseSchema, ErrorResponseSchema]);

//Input types
export type CreatePurchaseDTO = z.infer<typeof CreatePurchaseDTOSchema>;
export type PatchPurchaseDTO = z.infer<typeof PatchPurchaseDTOSchema>;

export type CreateOrPatchPurchaseDTO = z.infer<typeof CreateOrPatchPurchaseDTOUnionSchema>;
export type GetCompanyPurchasesDTO = z.infer<typeof GetCompanyPurchasesDTOSchema>;

//Zod types for payload validation
export type CreateOrPatchPurchaseAPIResponse = z.infer<typeof CreateOrPatchPurchaseAPIResponseSchema>;
export type GetPurchaseAPIResponse = z.infer<typeof GetPurchaseAPIResponseSchema>;
export type GetCompanyPurchasesAPIResponse = z.infer<typeof GetCompanyPurchaseAPIResponseSchema>;
