import { z } from "zod";
import { LINE_ITEM_DESCRIPTION_CHARS, LINE_ITEM_CATEGORY_CHARS } from "../utilities/constants";

const InvoiceLineItemSchema = z.object({
    id: z.string(),
    description: z
        .string()
        .max(LINE_ITEM_DESCRIPTION_CHARS, `Description must be at most ${LINE_ITEM_DESCRIPTION_CHARS} characters.`)
        .optional(),
    invoiceId: z.string(),
    quickbooksId: z.number().int().positive().optional(),
    amountCents: z.number().int().nonnegative(),
    category: z
        .string()
        .max(LINE_ITEM_CATEGORY_CHARS, `Category must be at most ${LINE_ITEM_CATEGORY_CHARS} characters.`)
        .optional(),
    quickbooksDateCreated: z.iso.datetime().optional(),
    dateCreated: z.iso.datetime(),
    lastUpdated: z.iso.datetime(),
});

export const CreateOrUpdateInvoiceLineItemsDTOSchema = z.array(
    InvoiceLineItemSchema.omit({ id: true, dateCreated: true, lastUpdated: true })
);

export const CreateOrUpdateInvoiceLineItemsResponseSchema = z.array(InvoiceLineItemSchema);

export const GetInvoiceLineItemDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetInvoiceLineItemResponseSchema = InvoiceLineItemSchema;

export const GetInvoiceLineItemsByInvoiceDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetInvoiceLineItemsByInvoiceResponseSchema = z.array(InvoiceLineItemSchema);

// POST /quickbooks/invoice/line/bulk:
export type CreateOrUpdateInvoiceLineItemsDTO = z.infer<typeof CreateOrUpdateInvoiceLineItemsDTOSchema>;
export type CreateOrUpdateInvoiceLineItemsResponse = z.infer<typeof CreateOrUpdateInvoiceLineItemsResponseSchema>;

// GET /quickbooks/invoice/line/{id}
export type GetInvoiceLineItemDTO = z.infer<typeof GetInvoiceLineItemDTOSchema>;
export type GetInvoiceLineItemResponse = z.infer<typeof GetInvoiceLineItemResponseSchema>;

// GET /quickbooks/invoice/{id}/lines
export type GetInvoiceLineItemsByInvoiceDTO = z.infer<typeof GetInvoiceLineItemsByInvoiceDTOSchema>;
export type GetInvoiceLineItemsByInvoiceResponse = z.infer<typeof GetInvoiceLineItemsByInvoiceResponseSchema>;
