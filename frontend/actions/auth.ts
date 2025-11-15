"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseClient } from "@/utils/supabase/server";
import { loginInitialState, requiredOnboardingProgress, signupInitialState } from "@/types/user";
import { createClient } from "@supabase/supabase-js";

export async function login(prevState: loginInitialState, formData: FormData) {
    const supabase = await createSupabaseClient();
    const payload = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };
    const { error } = await supabase.auth.signInWithPassword(payload);
    if (error) {
        return {
            success: false,
            message: error.message || "Login failed",
        };
    }
    revalidatePath("/", "layout");
    redirect("/");
}

export async function logoutUser() {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error.message);
    } else {
        console.log("User signed out successfully.");
    }
}

export async function signup(prevState: signupInitialState, formData: FormData) {
    const supabase = await createSupabaseClient();
    const payload = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        options: {
            data: {
                onboarding_step: requiredOnboardingProgress.USER,
            },
        },
    };
    const { error } = await supabase.auth.signUp(payload);
    if (error) {
        return {
            success: false,
            message: error.message || "Login failed",
        };
    }

    return { success: true, message: "Form submitted successfully!", email: payload.email };
}

export async function setCompanyMetadata(companyID: string) {
    const supabaseClient = await createSupabaseClient();
    const supabaseService = createClient(
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SUPABASE_URL!
            : process.env.NEXT_PUBLIC_DEV_SUPABASE_URL!,
        process.env.NODE_ENV === "production"
            ? process.env.SUPABASE_SERVICE_ROLE_KEY!
            : process.env.SUPABASE_DEV_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
        throw new Error("User not logged in");
    }
    const user = data.user!.id;
    const response = await supabaseService.auth.admin.updateUserById(user, {
        app_metadata: {
            company_id: companyID,
        },
    });
    await supabaseClient.auth.updateUser({
        data: {
            onboarding_step: requiredOnboardingProgress.FINISHED,
        },
    });
    const { error: refreshError } = await supabaseClient.auth.refreshSession();

    if (refreshError) {
        throw new Error("Failed to refresh session");
    }
    return response;
}

export async function retrieveToken(): Promise<string> {
    const supabase = await createSupabaseClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) {
        throw new Error("Authorization token is missing.");
    }
    return data.session.access_token;
}
