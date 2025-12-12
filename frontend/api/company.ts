"use server";
import {
    Company,
    CompanyHasDataResponse,
    CreateCompanyRequest,
    GetClaimInProgressForCompanyResponse,
    GetCompanyLocationsResponse,
    UpdateCompanyRequest,
    UpdateCompanyResponse,
} from "@/types/company";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const createCompany = async (payload: CreateCompanyRequest): Promise<ServerActionResult<Company>> => {
    const req = async (token: string): Promise<ServerActionResult<Company>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/companies", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create company" };
        }
    };
    return authWrapper<ServerActionResult<Company>>()(req);
};

export const getCompanyLocations = async (): Promise<ServerActionResult<GetCompanyLocationsResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<GetCompanyLocationsResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies/location-address", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get company locations" };
        }
    };
    return authWrapper<ServerActionResult<GetCompanyLocationsResponse>>()(req);
};

export const getCompany = async (): Promise<ServerActionResult<Company>> => {
    const req = async (token: string): Promise<ServerActionResult<Company>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get company" };
        }
    };
    return authWrapper<ServerActionResult<Company>>()(req);
};

export const getClaimInProgress = async (): Promise<ServerActionResult<GetClaimInProgressForCompanyResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<GetClaimInProgressForCompanyResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies/claim-in-progress", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get claim in progress" };
        }
    };
    return authWrapper<ServerActionResult<GetClaimInProgressForCompanyResponse>>()(req);
};

export const companyHasData = async (): Promise<ServerActionResult<CompanyHasDataResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CompanyHasDataResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies/has-company-data", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data ?? { hasExternalData: false, hasFinancialData: false } };
        } else {
            return { success: false, error: error?.error || "Failed to check company data" };
        }
    };
    return authWrapper<ServerActionResult<CompanyHasDataResponse>>()(req);
};

export const updateCompany = async (
    payload: UpdateCompanyRequest
): Promise<ServerActionResult<UpdateCompanyResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateCompanyResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/companies", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update company" };
        }
    };
    return authWrapper<ServerActionResult<UpdateCompanyResponse>>()(req);
};
