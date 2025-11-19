"use server";
import { CreateInvoiceLineItemsRequest, CreateInvoiceLineItemsResponse } from "@/types/invoice-line-items";
import { authHeader, authWrapper, getClient } from "./client";

export const createBulkInvoiceLineItems = async (
    newLineItems: CreateInvoiceLineItemsRequest
): Promise<CreateInvoiceLineItemsResponse> => {
    const req = async (token: string): Promise<CreateInvoiceLineItemsResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/invoice/line/bulk", {
            body: newLineItems,
            headers: authHeader(token),
        });

        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };

    return authWrapper<CreateInvoiceLineItemsResponse>()(req);
};
