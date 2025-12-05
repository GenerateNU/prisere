import { CreateInvoiceLineItemsRequest, CreateInvoiceLineItemsResponse } from "@/types/invoice-line-items";
import { authHeader, clientAuthWrapper, getClient } from "./client";

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

    return clientAuthWrapper<CreateInvoiceLineItemsResponse>()(req);
};
