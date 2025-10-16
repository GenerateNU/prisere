import { Company, CreateCompanyRequest, CreateCompanyResponse } from "@/types/company";
import { authHeader, authWrapper, client } from "./client";

export const createCompany = async (payload: CreateCompanyRequest): Promise<Company> => {
    const req = async (token: string): Promise<Company> => {
        const { data, error, response } = await client.POST("/companies", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            console.log(data)
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<Company>()(req);
};
