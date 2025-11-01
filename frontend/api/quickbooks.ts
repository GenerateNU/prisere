"use server";

import { authHeader, authWrapper, getClient } from "./client";

export const importQuickbooksData = async (): Promise<{ success: true } | { error: string }> => {
    const req = async (token: string): Promise<{ success: true } | { error: string }> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/importQuickbooksData", {
            headers: authHeader(token)
        });
        if (response.ok) {
            return data!;
        } else if (response.status === 401) {
            return data!;
            // Redirect to quickhooks Oatuh
        } else {
            return data!;
            throw Error(error?.error);
        }
    };
    // To do: create typed response of importing QB data?
    return authWrapper<{ success: true } | { error: string }>()(req);
};