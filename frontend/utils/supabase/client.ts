"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
    return createBrowserClient(
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SUPABASE_URL!
            : process.env.NEXT_PUBLIC_DEV_SUPABASE_URL!,
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            : process.env.NEXT_PUBLIC_SUPABASE_DEV_PUBLISHABLE_KEY!
    );
}

/**
 * Get the current auth token from Supabase session (client-side)
 * @returns Promise<string> The access token
 * @throws Error if token is missing
 */
export async function getAuthToken(): Promise<string> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw new Error(`Failed to get session: ${error.message}`);
    }

    if (!data.session?.access_token) {
        throw new Error("Authorization token is missing.");
    }

    return data.session.access_token;
}
