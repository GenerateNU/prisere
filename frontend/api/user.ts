"use server";
import {
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserResponse,
    User,
    requiredOnboardingProgress,
} from "@/types/user";
import { createSupabaseClient } from "@/utils/supabase/server";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const createUser = async (payload: CreateUserRequest): Promise<ServerActionResult<User>> => {
    const req = async (token: string): Promise<ServerActionResult<User>> => {
        const supabase = await createSupabaseClient();
        if (!payload.email) {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                return { success: false, error: "Error with Retrieving Email. Please Try Again" };
            }
            payload.email = data.user?.email;
        }
        const client = getClient();
        const { data, error, response } = await client.POST("/users", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            await supabase.auth.updateUser({
                data: {
                    onboarding_step: requiredOnboardingProgress.COMPANY,
                },
            });
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create user" };
        }
    };
    return authWrapper<ServerActionResult<User>>()(req);
};

export const getUser = async (): Promise<ServerActionResult<User>> => {
    const req = async (token: string): Promise<ServerActionResult<User>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/users", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get user" };
        }
    };
    return authWrapper<ServerActionResult<User>>()(req);
};

export const updateUserInfo = async (
    payload: UpdateUserRequest & { id: string }
): Promise<ServerActionResult<UpdateUserResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateUserResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/users", {
            headers: authHeader(token),
            body: { ...payload, id: payload.id },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update user info" };
        }
    };

    return authWrapper<ServerActionResult<UpdateUserResponse>>()(req);
};
