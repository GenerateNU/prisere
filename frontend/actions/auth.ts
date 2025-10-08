"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseClient } from "@/utils/supabase/server";
import { createUser } from "@/api/user";

export async function login(prevState: any, formData: FormData) {
    const supabase = await createSupabaseClient();
    const payload = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };
    const {error} = await supabase.auth.signInWithPassword(payload);
    if (error) {
        return { 
            success: false, 
            message: error.message || 'Login failed' 
            }
    }
    revalidatePath("/", "layout");
    redirect("/");
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createSupabaseClient();
    const payload = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };
    const {error} = await supabase.auth.signUp(payload);
    if (error) {
        return { 
            success: false, 
            message: error.message || 'Login failed' 
            }
    } 
    revalidatePath("/", "layout");
    redirect("/");
}


export async function retrieveToken(): Promise<string> {
    const supabase = await createSupabaseClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) {
      throw new Error("Authorization token is missing.");
    }
    return data.session.access_token
}