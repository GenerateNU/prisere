"use server";
import { CreateInvoiceLineItemsRequest, CreateInvoiceLineItemsResponse } from "@/types/invoice-line-items";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const createBulkInvoiceLineItems = async (
    newLineItems: CreateInvoiceLineItemsRequest
): Promise<ServerActionResult<CreateInvoiceLineItemsResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CreateInvoiceLineItemsResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/invoice/line/bulk", {
            body: newLineItems,
            headers: authHeader(token),
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create invoice line items" };
        }
    };

    return authWrapper<ServerActionResult<CreateInvoiceLineItemsResponse>>()(req);
};
