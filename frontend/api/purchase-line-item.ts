"use server";
import { CreatePurchaseLineItemsRequest, CreatePurchaseLineItemsResponse } from "../types/purchase-line-items";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const createBulkPurchaseLineItems = async (
    newLineItems: CreatePurchaseLineItemsRequest
): Promise<ServerActionResult<CreatePurchaseLineItemsResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CreatePurchaseLineItemsResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/purchase/line/bulk", {
            body: newLineItems,
            headers: authHeader(token),
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create purchase line items" };
        }
    };

    return authWrapper<ServerActionResult<CreatePurchaseLineItemsResponse>>()(req);
};
