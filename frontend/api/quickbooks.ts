"use server";

import { authHeader, authWrapper, getClient } from "./client";

export const importQuickbooksData = async (): Promise<{ success: true } | undefined> => {
    const req = async (token: string): Promise<{ success: true } | undefined> => {
        const client = getClient();
        console.log("About to post import request")
        const { data, error, response } = await client.POST("/quickbooks/importQuickbooksData", {
            headers: authHeader(token)
        });
        if (response.ok) {
            return data!;
        } else if (response.status === 401) {
            // throw Error(error?.error);
            console.log("Warning: No quickbooks client")
            // Redirect to quickhooks Oatuh
        } else {
            // throw Error(error?.error);
            console.log("No quickbooks client")
        }
    };
    return authWrapper<{ success: true } | { error: string }>()(req);
};