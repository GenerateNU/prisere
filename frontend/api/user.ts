"use server";
import { CreateUserRequest, User, requiredOnboardingProgress } from "@/types/user";
import { authHeader, authWrapper, getClient } from "./client";
import { createSupabaseClient } from "@/utils/supabase/server";
import Onboarding from "@/app/signup/onboarding";

export const createUser = async (payload: CreateUserRequest): Promise<User> => {
    const req = async (token: string): Promise<User> => {
        const supabase = await createSupabaseClient();
        if(!payload.email) {
            const { data, error } = await supabase.auth.getUser();
            if (error){ 
                throw Error("Error with Retrieving Email. Please Try Again")
            }
            payload.email = data.user?.email
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
                }
            });
            return data!
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<User>()(req);
};
