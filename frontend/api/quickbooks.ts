"use server";

import { authHeader, authWrapper, getClient } from "./client";

export const importQuickbooksData = async (): Promise<{ success: true } | undefined> => {
    
    const req = async (token: string): Promise<{ success: true } | undefined> => {
        const client = getClient();
        const { data, response } = await client.POST("/quickbooks/importQuickbooksData", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else if (response.status === 401) {
            console.log("Warning: No quickbooks client");
        } else {
            console.log("No quickbooks client");
        }
    };
    return authWrapper<{ success: true } | undefined>()(req);
};
