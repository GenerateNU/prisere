import { z } from "zod";
import { PurchaseLineItemType } from "../../entities/PurchaseLineItem";
import { GetPurchaseLineItemResponseSchema } from "../purchase-line-item/types";

export const CreateOrChangePurchaseRequestSchema = z
    .array(
        z.object({
            quickBooksId: z.number().optional(),
            totalAmountCents: z.number().min(0),
            isRefund: z.boolean(),
            quickbooksDateCreated: z.iso.datetime().optional(),
        })
    )
    .nonempty();
export const CreateOrChangePurchaseDTOSchema = z
    .array(
        z.object({
            quickBooksId: z.number().optional(),
            totalAmountCents: z.number().min(0),
            isRefund: z.boolean(),
            companyId: z.string().nonempty(),
            quickbooksDateCreated: z.iso.datetime().optional(),
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

export const GetPurchaseWithLineItems = GetPurchasesResponseSchema.extend({
    lineItems : z.array(GetPurchaseLineItemResponseSchema)
});


enum SortByColumn {
    DATE = "date",
    AMOUNT = "totalAmountCents",
}


export const GetCompanyPurchasesQueryParams = z.object({
    pageNumber: z.number().gte(0).optional().default(0),
    resultsPerPage: z.number().gt(0).optional().default(20),
    sortBy: z.enum(SortByColumn).optional(),
    sortOrder: z.enum(["ASC", "DESC"]).optional().default('DESC'),
    categories: z.array(z.string().nonempty()).optional().default([]),
    type: z.enum(PurchaseLineItemType).optional(),
    dateFrom : z.string().datetime().optional(),
    dateTo : z.string().datetime().optional().default(new Date().toISOString()),
    search : z.string().optional(),
});

/**
 * This was expanded to support server side sorting, filtering, and search.
 */
export const GetCompanyPurchasesDTOSchema = GetCompanyPurchasesQueryParams.extend({
    companyId: z.uuid(),
});

export const GetPurchaseDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetCompanyPurchasesByDateDTOSchema = z.object({
    companyId: z.string(),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
});

export const GetCompanyPurchasesResponseSchema = z.array(GetPurchaseWithLineItems);

export const GetCompanyPurchasesSummationResponseSchema = z.object({
    total: z.number().nonnegative(),
});

export const GetCompanyPurchasesInMonthBinsResponseSchema = z.array(
    z.object({
        month: z.string(),
        total: z.number().nonnegative(),
    })
);

//Controller Responses
export type CreateOrChangePurchaseResponse = z.infer<typeof CreateOrChangePurchasesResponseSchema>;
export type GetPurchaseResponse = z.infer<typeof GetPurchasesResponseSchema>;
export type GetCompanyPurchasesResponse = z.infer<typeof GetCompanyPurchasesResponseSchema>;
export type GetCompanyPurchasesSummationResponse = z.infer<typeof GetCompanyPurchasesSummationResponseSchema>;
export type GetCompanyPurchasesInMonthBinsResponse = z.infer<typeof GetCompanyPurchasesInMonthBinsResponseSchema>;

//Input types
export type CreateOrChangePurchaseRequest = z.infer<typeof CreateOrChangePurchaseRequestSchema>;
export type CreateOrChangePurchaseDTO = z.infer<typeof CreateOrChangePurchaseDTOSchema>;
export type GetCompanyPurchasesDTO = z.infer<typeof GetCompanyPurchasesDTOSchema>;
export type GetCompanyPurchasesByDateDTO = z.infer<typeof GetCompanyPurchasesByDateDTOSchema>;
export type GetPurchaseDTO = z.infer<typeof GetPurchaseDTOSchema>;
