import createClient from "openapi-fetch";
import type { paths } from "../schema";
import { retrieveToken } from "@/actions/auth";

const apiBaseRoute =
    process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_PROD_API_BASE_URL
        : process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;
export const client = createClient<paths>({ baseUrl: apiBaseRoute });


export const authHeader = (token: string, contentType: string = "application/json") => {
    return {
        "Content-Type": contentType,
        Authorization: `Bearer ${token}`,
    };
};

export const authWrapper =
    <T>() =>
    async (fn: (token: string) => Promise<T>) => {
        const token = await retrieveToken();
        return fn(token);
    };
