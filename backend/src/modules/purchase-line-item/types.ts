import { z } from "zod";
import { PurchaseLineItemType } from "../../entities/PurchaseLineItem";

export const CreateOrChangePurchaseLineItemsDTOSchema = z
    .array(
        z.object({
            id: z.string().nonempty().optional(),
            description: z.string(),
            quickBooksId: z.number(),
            purchaseId: z.string().nonempty(),
            amountCents: z.number().min(0),
            category: z.string().nonempty(),
            type: z.enum(PurchaseLineItemType),
        })
    )
    .nonempty();

export const CreateOrChangePurchaseLineItemsResponseSchema = z.array(
    z.object({
        id: z.string().nonempty(),
        description: z.string(),
        quickBooksId: z.number(),
        purchaseId: z.string(),
        amountCents: z.number(),
        category: z.string().nonempty(),
        type: z.enum(PurchaseLineItemType),
        dateCreated: z.string(),
        lastUpdated: z.string(),
    })
);

export const GetPurchaseLineItemResponseSchema = z.object({
    id: z.string().nonempty(),
    description: z.string(),
    quickBooksId: z.number(),
    purchaseId: z.string(),
    amountCents: z.number(),
    category: z.string().nonempty(),
    type: z.enum(PurchaseLineItemType),
    dateCreated: z.string(),
    lastUpdated: z.string(),
});

export const GetPurchaseLineItemsFromParentResponseSchema = z.array(GetPurchaseLineItemResponseSchema);

//Controller Responses
export type CreateOrChangePurchaseLineItemsResponse = z.infer<typeof CreateOrChangePurchaseLineItemsResponseSchema>;
export type GetPurchaseLineItemResponse = z.infer<typeof GetPurchaseLineItemResponseSchema>;
export type GetPurchaseLineItemsFromParentResponse = z.infer<typeof GetPurchaseLineItemsFromParentResponseSchema>;

//Input types
export type CreateOrChangePurchaseLineItemsDTO = z.infer<typeof CreateOrChangePurchaseLineItemsDTOSchema>;
