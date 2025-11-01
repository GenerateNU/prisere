"use server";
import { Company, CreateCompanyRequest, GetCompanyLocationsResponse } from "@/types/company";
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

export const getCompanyLocations = async (): Promise<GetCompanyLocationsResponse> => {
    const req = async (token: string): Promise<GetCompanyLocationsResponse> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies/location-address", {
            headers: authHeader(token),
        });
        if (response.ok) {
            console.log(data);
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<GetCompanyLocationsResponse>()(req);
};

export const getCompany = async (): Promise<Company> => {
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
