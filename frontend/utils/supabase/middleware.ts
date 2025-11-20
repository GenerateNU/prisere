import { progressToNumber, requiredOnboardingProgress } from "@/types/user";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SUPABASE_URL!
            : process.env.NEXT_PUBLIC_DEV_SUPABASE_URL!,
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            : process.env.NEXT_PUBLIC_SUPABASE_DEV_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isOnSignupPage = request.nextUrl.pathname === "/signup" && request.nextUrl.searchParams.has("stage");
    if (
        (!isOnSignupPage &&
            user &&
            user.user_metadata.onboarding_step &&
            user.user_metadata.onboarding_step != requiredOnboardingProgress.FINISHED) ||
        (isOnSignupPage &&
            user &&
            user.user_metadata.onboarding_step &&
            progressToNumber[user.user_metadata.onboarding_step as requiredOnboardingProgress] !=
                parseInt(request.nextUrl.searchParams.get("stage")!))
    ) {
        const url = request.nextUrl.clone();
        url.pathname = `/signup`;
        url.search = `?stage=${progressToNumber[user.user_metadata.onboarding_step as requiredOnboardingProgress]}`;
        return NextResponse.redirect(url);
    }
    if (
        (isOnSignupPage || request.nextUrl.pathname.startsWith("/login")) &&
        user &&
        user.user_metadata.onboarding_step &&
        user.user_metadata.onboarding_step == requiredOnboardingProgress.FINISHED
    ) {
        const url = request.nextUrl.clone();
        url.pathname = `/`;
        url.search = "";
        return NextResponse.redirect(url);
    }
    if (
        (!user &&
            !request.nextUrl.pathname.startsWith("/login") &&
            !request.nextUrl.pathname.startsWith("/signup") &&
            !request.nextUrl.pathname.startsWith("/error")) ||
        (!user && isOnSignupPage)
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.search = "";
        return NextResponse.redirect(url);
    }
    return supabaseResponse;
}
