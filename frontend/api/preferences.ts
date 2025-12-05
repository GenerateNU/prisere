"use server";

import { UpdateUserNotificationPreferencesDTO, UserPreferences } from "@/types/preferences";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const getUserPreferences = async (): Promise<ServerActionResult<UserPreferences>> => {
    const req = async (token: string): Promise<ServerActionResult<UserPreferences>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/preferences", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get user preferences" };
        }
    };
    return authWrapper<ServerActionResult<UserPreferences>>()(req);
};

export const updateUserPreferences = async (
    preferences: UpdateUserNotificationPreferencesDTO
): Promise<ServerActionResult<UserPreferences>> => {
    const req = async (token: string): Promise<ServerActionResult<UserPreferences>> => {
        const client = getClient();
        const { data, error, response } = await client.PUT("/preferences", {
            headers: authHeader(token),
            body: preferences,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update user preferences" };
        }
    };
    return authWrapper<ServerActionResult<UserPreferences>>()(req);
};
