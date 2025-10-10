import { z } from "zod";

//Patch existing quick books purchase
export const CreateOrChangePurchaseDTOSchema = z
    .array(
        z.object({
            quickBooksId: z.number().optional(),
            totalAmountCents: z.number().min(0),
            isRefund: z.boolean(),
            companyId: z.string().nonempty(),
            quickbooksDateCreated: z.date().optional(),
        })
    )
    .nonempty();

export const CreateOrChangePurchasesResponseSchema = z.array(
    z.object({
        id: z.string().nonempty(),
        companyId: z.string().nonempty(),
        quickBooksId: z.number().optional(),
        totalAmountCents: z.number().min(0),
        quickbooksDateCreated: z.string().optional(),
        isRefund: z.boolean(),
        dateCreated: z.string(),
    })
);

export const GetPurchasesResponseSchema = z.object({
    id: z.string().nonempty(),
    companyId: z.string().nonempty(),
    quickBooksId: z.number().optional(),
    totalAmountCents: z.number().min(0),
    quickbooksDateCreated: z.string().optional(),
    isRefund: z.boolean(),
    dateCreated: z.string(),
    lastUpdated: z.string(),
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
        totalAmountCents: z.number().min(0),
        quickbooksDateCreated: z.string().optional(),
        isRefund: z.boolean(),
        dateCreated: z.string(),
    })
);

//Controller Responses
export type CreateOrChangePurchaseResponse = z.infer<typeof CreateOrChangePurchasesResponseSchema>;
export type GetPurchaseResponse = z.infer<typeof GetPurchasesResponseSchema>;
export type GetCompanyPurchasesResponse = z.infer<typeof GetCompanyPurchasesResponseSchema>;

//Input types
export type CreateOrChangePurchaseDTO = z.infer<typeof CreateOrChangePurchaseDTOSchema>;
export type GetCompanyPurchasesDTO = z.infer<typeof GetCompanyPurchasesDTOSchema>;
