import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseClient() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SUPABASE_URL!
            : process.env.NEXT_PUBLIC_DEV_SUPABASE_URL!,
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            : process.env.NEXT_PUBLIC_SUPABASE_DEV_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch {}
                },
            },
        }
    );
}
