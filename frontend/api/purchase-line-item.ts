import { CreatePurchaseLineItemsRequest, CreatePurchaseLineItemsResponse } from "../types/purchase-line-items";
import { authHeader, clientAuthWrapper, getClient } from "./client";

export const createBulkPurchaseLineItems = async (
    newLineItems: CreatePurchaseLineItemsRequest
): Promise<CreatePurchaseLineItemsResponse> => {
    const req = async (token: string): Promise<CreatePurchaseLineItemsResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/purchase/line/bulk", {
            body: newLineItems,
            headers: authHeader(token),
        });

        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };

    return clientAuthWrapper<CreatePurchaseLineItemsResponse>()(req);
};
