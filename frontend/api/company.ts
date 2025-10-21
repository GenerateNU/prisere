"use server";
import { Company, CreateCompanyRequest } from "@/types/company";
import { authHeader, authWrapper, getClient } from "./client";

export const createCompany = async (payload: CreateCompanyRequest): Promise<Company> => {
    const req = async (token: string): Promise<Company> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/companies", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            console.log(data);
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<Company>()(req);
};
