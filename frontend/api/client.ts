import { retrieveToken } from "@/actions/auth";
import { getAuthToken } from "@/utils/supabase/client";
import createClient from "openapi-fetch";
import type { paths } from "../schema";

export const getClient = () => {
    const apiBaseRoute =
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_PROD_API_BASE_URL
            : process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
    console.log(apiBaseRoute);
    console.log(process.env.NEXT_PUBLIC_PROD_API_BASE_URL);
    console.log(process.env.PROD_API_BASE_URL);
    console.log(process.env.NODE_ENV);
    console.log("ROUTING!");

    return createClient<paths>({ baseUrl: apiBaseRoute });
};

export const authHeader = (token: string, contentType: string = "application/json") => {
    return {
        "Content-Type": contentType,
        Authorization: `Bearer ${token}`,
    };
};

/**
 * Server-side: Wraps a function that needs authentication token
 * Uses retrieveToken() which accesses cookies server-side
 */
export const authWrapper =
    <T>() =>
    async (fn: (token: string) => Promise<T>) => {
        const token = await retrieveToken();
        return fn(token);
    };

/**
 * Client-side: Gets auth token for use in client components
 * Uses getAuthToken() which reads from browser cookies/storage
 */
export const getClientAuthToken = async (): Promise<string> => {
    return await getAuthToken();
};
