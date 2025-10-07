import { z } from "zod";
import { INVOICE_LINE_ITEM_CATEGORY_CHARS, INVOICE_LINE_ITEM_DESCRIPTION_CHARS } from "../entities/InvoiceLineItem";

const InvoiceLineItemSchema = z.object({
    id: z.string(),
    description: z.string().max(INVOICE_LINE_ITEM_DESCRIPTION_CHARS, `Description must be at most ${INVOICE_LINE_ITEM_DESCRIPTION_CHARS} characters.`).optional(),
    invoiceId: z.string(),
    quickbooksId: z.number().int().positive().optional(),
    amountCents: z.number().int().nonnegative(),
    category: z.string().max(INVOICE_LINE_ITEM_CATEGORY_CHARS, `Category must be at most ${INVOICE_LINE_ITEM_CATEGORY_CHARS} characters.`).optional(),
    dateCreated: z.iso.datetime().default(new Date().toISOString()),
});

export const CreateOrUpdateInvoiceLineItemsDTOSchema = z.array(
    InvoiceLineItemSchema.omit({id: true})
);

export const CreateOrUpdateInvoiceLineItemsResponseSchema = z.array(
   InvoiceLineItemSchema
);

export const GetInvoiceLineItemDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetInvoiceLineItemResponseSchema = InvoiceLineItemSchema;

export const GetInvoiceLineItemsByInvoiceDTOSchema = z.object({
    id: z.string().nonempty(),
});

export const GetInvoiceLineItemsByInvoiceResponseSchema = z.array(
    InvoiceLineItemSchema
);

// POST /quickbooks/invoice/line/bulk:
export type CreateOrUpdateInvoiceLineItemsDTO = z.infer<typeof CreateOrUpdateInvoiceLineItemsDTOSchema>;
export type CreateOrUpdateInvoiceLineItemsResponse = z.infer<typeof CreateOrUpdateInvoiceLineItemsResponseSchema>;

// GET /quickbooks/invoice/line/{id}
export type GetInvoiceLineItemDTO = z.infer<typeof GetInvoiceLineItemDTOSchema>;
export type GetInvoiceLineItemResponse = z.infer<typeof GetInvoiceLineItemResponseSchema>;

// GET /quickbooks/invoice/{id}/lines
export type GetInvoiceLineItemsByInvoiceDTO = z.infer<typeof GetInvoiceLineItemsByInvoiceDTOSchema>;
export type GetInvoiceLineItemsByInvoiceResponse = z.infer<typeof GetInvoiceLineItemsByInvoiceResponseSchema>;
