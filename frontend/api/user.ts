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

export const createUser = async (payload: CreateUserRequest): Promise<User> => {
    const req = async (token: string): Promise<User> => {
        const supabase = await createSupabaseClient();
        if (!payload.email) {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                throw Error("Error with Retrieving Email. Please Try Again");
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
            console.log(error);
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<User>()(req);
};

export const getUser = async (): Promise<User> => {
    const req = async (token: string): Promise<User> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/users", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<User>()(req);
};

export const updateUserInfo = async (payload: UpdateUserRequest & { id: string }) => {
    const req = async (token: string) => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/users", {
            headers: authHeader(token),
            body: { ...payload, id: payload.id },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };

    return authWrapper<UpdateUserResponse>()(req);
};
