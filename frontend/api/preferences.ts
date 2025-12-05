import { UpdateUserNotificationPreferencesDTO, UserPreferences } from "@/types/preferences";
import { authHeader, clientAuthWrapper, getClient } from "./client";

export const getUserPreferences = async () => {
    const req = async (token: string) => {
        const client = getClient();
        const { data, error, response } = await client.GET("/preferences", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<UserPreferences>()(req);
};

export const updateUserPreferences = async (preferences: UpdateUserNotificationPreferencesDTO) => {
    const req = async (token: string) => {
        const client = getClient();
        const { data, error, response } = await client.PUT("/preferences", {
            headers: authHeader(token),
            body: preferences,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<Awaited<ReturnType<typeof req>>>()(req);
};
