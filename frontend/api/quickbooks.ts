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

export const redirectToQuickbooks = async (): Promise<string | undefined> => {
    const req = async (token: string): Promise<string | undefined> => {
        const client = getClient();
        const { data, response } = await client.GET("/quickbooks", {
            headers: authHeader(token),
        });

        if (response.ok && data?.url) {
            return data.url;
        } else if (response.status === 401) {
            console.log("Warning: Unauthorized access to QuickBooks");
        } else {
            console.log("Error: Unable to fetch QuickBooks URL");
        }
    };

    return authWrapper<string | undefined>()(req);
};
