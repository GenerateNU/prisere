"use server";

import { Company } from "@/types/company";
import { authHeader, authWrapper, getClient } from "./client";

export const getCompanyServerSide = async (): Promise<Company> => {
    const req = async (token: string): Promise<Company> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<Company>()(req);
};
