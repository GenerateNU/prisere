import { authHeader, clientAuthWrapper, getClient } from "./client";

export const importQuickbooksData = async (): Promise<{ success: true } | undefined> => {
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
    return clientAuthWrapper<{ success: true } | undefined>()(req);
};

export const redirectToQuickbooks = async (): Promise<string | undefined> => {
    const req = async (token: string): Promise<string | undefined> => {
        const client = getClient();
        const { data, response } = await client.GET("/quickbooks", {
            headers: authHeader(token),
        });

        if (response.ok && data?.url) {
            return data.url;
        } else {
            // TODO: error message
            return undefined;
        }
    };

    return clientAuthWrapper<string | undefined>()(req);
};
