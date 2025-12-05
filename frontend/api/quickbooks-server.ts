"use server";

import { authHeader, authWrapper, getClient } from "./client";

export const importQuickbooksDataServerSide = async (): Promise<{ success: true } | undefined> => {
    const req = async (token: string): Promise<{ success: true } | undefined> => {
        const client = getClient();
        const { data, response } = await client.POST("/quickbooks/importQuickbooksData", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            return undefined;
        }
    };
    return authWrapper<{ success: true } | undefined>()(req);
};
