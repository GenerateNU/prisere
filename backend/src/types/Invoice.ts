import { z } from "zod";

export const CreateOrUpdateInvoicesRequestSchema = z.array(
    z.object({
        quickbooksId: z.number().int().positive().optional(),
        totalAmountCents: z.number().int().nonnegative(),
        quickbooksDateCreated: z.iso.datetime().optional(),
    })
);
export const CreateOrUpdateInvoicesDTOSchema = z.array(
    z.object({
        companyId: z.string(),
        quickbooksId: z.number().int().positive().optional(),
        totalAmountCents: z.number().int().nonnegative(),
        quickbooksDateCreated: z.iso.datetime().optional(),
    })
);

export const CreateOrUpdateInvoiceResponseSchema = z.array(
    z.object({
        id: z.string(),
        companyId: z.string(),
        quickbooksId: z.number().int().positive().optional(),
        totalAmountCents: z.number().int().nonnegative(),
        dateCreated: z.iso.datetime(),
        lastUpdated: z.iso.datetime(),
        quickbooksDateCreated: z.iso.datetime().optional(),
    })
);

export const GetInvoiceDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetInvoiceResponseSchema = z.object({
    id: z.string(),
    companyId: z.string(),
    quickbooksId: z.number().int().positive().optional(),
    totalAmountCents: z.number().int().nonnegative(),
    dateCreated: z.iso.datetime(),
    lastUpdated: z.iso.datetime(),
    quickbooksDateCreated: z.iso.datetime().optional(),
});

export const GetCompanyInvoicesDTOSchema = z.object({
    companyId: z.string(),
    pageNumber: z.number().optional().default(0),
    resultsPerPage: z.number().optional().default(20),
});

export const GetCompanyInvoicesParams = z.object({
    pageNumber: z.number().optional().default(0),
    resultsPerPage: z.number().optional().default(20),
});

export const GetCompanyInvoicesByDateDTOSchema = z.object({
    companyId: z.string(),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
});

export const GetCompanyInvoicesSummationResponseSchema = z.object({
    total: z.number().nonnegative(),
});

export const GetCompanyInvoicesInMonthBinsResponseSchema = z.array(
    z.object({
        month: z.string(),
        total: z.number().nonnegative(),
    })
);

export const GetCompanyInvoicesResponseSchema = z.array(GetInvoiceResponseSchema);

//Controller Responses
export type CreateOrUpdateInvoicesResponse = z.infer<typeof CreateOrUpdateInvoiceResponseSchema>;
export type GetInvoiceResponse = z.infer<typeof GetInvoiceResponseSchema>;
export type GetCompanyInvoicesResponse = z.infer<typeof GetCompanyInvoicesResponseSchema>;
export type GetCompanyInvoicesSummationResponse = z.infer<typeof GetCompanyInvoicesSummationResponseSchema>;
export type GetCompanyInvoicesInMonthBinsResponse = z.infer<typeof GetCompanyInvoicesInMonthBinsResponseSchema>;

//Input types
export type CreateOrUpdateInvoicesRequest = z.infer<typeof CreateOrUpdateInvoicesRequestSchema>;
export type CreateOrUpdateInvoicesDTO = z.infer<typeof CreateOrUpdateInvoicesDTOSchema>;
export type GetCompanyInvoicesDTO = z.infer<typeof GetCompanyInvoicesDTOSchema>;
export type GetCompanyInvoicesByDateDTO = z.infer<typeof GetCompanyInvoicesByDateDTOSchema>;
