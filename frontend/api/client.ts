'use server';
import createClient from "openapi-fetch";
import type { paths } from "../schema";
import { retrieveToken } from "@/actions/auth";

export const getClient = async () => {
    const apiBaseRoute =
        process.env.NODE_ENV === "production"
            ? process.env.PROD_API_BASE_URL
            : process.env.LOCAL_API_BASE_URL;
    
    return createClient<paths>({ baseUrl: apiBaseRoute });
};

export const authHeader = async (token: string, contentType: string = "application/json") => {
    return {
        "Content-Type": contentType,
        Authorization: `Bearer ${token}`,
    };
};

export const authWrapper =
    async <T>() =>
    async (fn: (token: string) => Promise<T>) => {
        const token = await retrieveToken();
        return fn(token);
    };
