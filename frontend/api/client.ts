import createClient from "openapi-fetch";
import type { paths } from "../schema";
import { retrieveToken } from "@/actions/auth";

const apiBaseRoute =
    process.env.NODE_ENV === "production"
        ? process.env.PROD_API_BASE_URL
        : process.env.LOCAL_API_BASE_URL;

console.log('API Base Route:', apiBaseRoute);
console.log('NODE_ENV:', process.env.NODE_ENV);

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
