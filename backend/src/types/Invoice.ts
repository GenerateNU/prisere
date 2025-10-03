import { z } from "zod";
import { ErrorResponseSchema } from "./Utils";

export const CreateOrUpdateInvoicesDTOSchema = z.array(
    z.object({
        companyId: z.string(),
        quickbooksId: z.number(),
        totalAmountCents: z.number(),
        dateCreated: z.iso.datetime().default(new Date().toISOString()),
    })
);

export const CreateOrUpdateInvoiceResponseSchema = z.object({
    id: z.string(),
    companyId: z.string(),
    quickbooksId: z.number(),
    totalAmountCents: z.number(),
    dateCreated: z.iso.datetime(),
});


export const GetInvoiceResponseSchema = z.object({
    id: z.string(),
    companyId: z.string(),
    quickbooksId: z.number(),
    totalAmountCents: z.number(),
    dateCreated: z.date(),
    lastUpdated: z.date(),
});

export const GetCompanyInvoicesDTOSchema = z.object({
    companyId: z.string(), 
    pageNumber: z.number().optional().default(0),
    resultsPerPage: z.number().optional().default(20),
});

export const GetCompanyInvoicesResponseSchema = z.array(GetInvoiceResponseSchema);

//Controller Responses
export type CreateOrUpdateInvoicesResponse = z.infer<typeof CreateOrUpdateInvoiceResponseSchema>;
export type GetInvoiceResponse = z.infer<typeof GetInvoiceResponseSchema>;
export type GetCompanyInvoicesResponse = z.infer<typeof GetCompanyInvoicesResponseSchema>;

//API Response Schemas
export const CreateInvoiceAPIResponseSchema = z.union([
    CreateOrUpdateInvoiceResponseSchema,
    ErrorResponseSchema,
]);


export const GetInvoiceAPIResponseSchema = z.union([
    GetInvoiceResponseSchema,
    ErrorResponseSchema,
]);

export const GetCompanyInvoiceAPIResponseSchema = z.union([
    GetCompanyInvoicesResponseSchema,
    ErrorResponseSchema,
]);

//Input types
export type CreateOrUpdateInvoicesDTO = z.infer<typeof CreateOrUpdateInvoicesDTOSchema>;
export type GetCompanyInvoicesDTO = z.infer<typeof GetCompanyInvoicesDTOSchema>;

//Zod types for payload validation
export type CreateOrUpdateInvoicesAPIResponse = z.infer<typeof CreateOrUpdateInvoicesDTOSchema>;
export type GetInvoiceAPIResponse = z.infer<typeof GetInvoiceAPIResponseSchema>;
export type GetCompanyInvoicesAPIResponse = z.infer<typeof GetCompanyInvoiceAPIResponseSchema>;