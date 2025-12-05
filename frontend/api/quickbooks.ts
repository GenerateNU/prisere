"use server";

import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const importQuickbooksData = async (): Promise<ServerActionResult<{ success: true }>> => {
    const req = async (token: string): Promise<ServerActionResult<{ success: true }>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/quickbooks/importQuickbooksData", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to import QuickBooks data" };
        }
    };
    return authWrapper<ServerActionResult<{ success: true }>>()(req);
};

export const redirectToQuickbooks = async (): Promise<ServerActionResult<string>> => {
    const req = async (token: string): Promise<ServerActionResult<string>> => {
        const client = getClient();
        const { data, response, error } = await client.GET("/quickbooks", {
            headers: authHeader(token),
        });

        if (response.ok && data?.url) {
            return { success: true, data: data.url };
        } else {
            return { success: false, error: error || "Failed to get QuickBooks redirect URL" };
        }
    };

    return authWrapper<ServerActionResult<string>>()(req);
};
