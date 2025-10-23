import { z } from "zod";
import { PurchaseLineItemType } from "../../entities/PurchaseLineItem";
import { LINE_ITEM_CATEGORY_CHARS, LINE_ITEM_DESCRIPTION_CHARS } from "../../utilities/constants";

export const CreateOrChangePurchaseLineItemsDTOSchema = z
    .array(
        z.object({
            description: z
                .string()
                .max(
                    LINE_ITEM_DESCRIPTION_CHARS,
                    `Description must be at most ${LINE_ITEM_DESCRIPTION_CHARS} characters.`
                )
                .optional(),
            quickBooksId: z.number().optional(),
            purchaseId: z.string().nonempty(),
            amountCents: z.number().min(0),
            category: z
                .string()
                .max(LINE_ITEM_CATEGORY_CHARS, `Category must be at most ${LINE_ITEM_CATEGORY_CHARS} characters.`)
                .nullish(),
            type: z.enum(PurchaseLineItemType),
            quickbooksDateCreated: z.iso.datetime().optional(),
        })
    )
    .nonempty();

export const CreateOrChangePurchaseLineItemsResponseSchema = z.array(
    z.object({
        id: z.string().nonempty(),
        description: z.string().optional(),
        quickBooksId: z.number().optional(),
        purchaseId: z.string(),
        amountCents: z.number(),
        category: z.string().nonempty().nullish(),
        type: z.enum(PurchaseLineItemType),
        dateCreated: z.string(),
        lastUpdated: z.string(),
        quickbooksDateCreated: z.iso.datetime().optional(),
    })
);

export const GetPurchaseLineItemResponseSchema = z.object({
    id: z.string().nonempty(),
    description: z.string().optional(),
    quickBooksId: z.number().optional(),
    purchaseId: z.string(),
    amountCents: z.number(),
    category: z.string().nonempty().nullish(),
    type: z.enum(PurchaseLineItemType),
    dateCreated: z.string(),
    lastUpdated: z.string(),
    quickbooksDateCreated: z.iso.datetime().optional(),
});

export const GetPurchaseLineItemsFromParentResponseSchema = z.array(GetPurchaseLineItemResponseSchema);

//Controller Responses
export type CreateOrChangePurchaseLineItemsResponse = z.infer<typeof CreateOrChangePurchaseLineItemsResponseSchema>;
export type GetPurchaseLineItemResponse = z.infer<typeof GetPurchaseLineItemResponseSchema>;
export type GetPurchaseLineItemsFromParentResponse = z.infer<typeof GetPurchaseLineItemsFromParentResponseSchema>;

//Input types
export type CreateOrChangePurchaseLineItemsDTO = z.infer<typeof CreateOrChangePurchaseLineItemsDTOSchema>;
