import {
    Company,
    CompanyHasDataResponse,
    CreateCompanyRequest,
    GetClaimInProgressForCompanyResponse,
    GetCompanyLocationsResponse,
    UpdateCompanyRequest,
    UpdateCompanyResponse,
} from "@/types/company";
import { authHeader, clientAuthWrapper, getClient } from "./client";

export const createCompany = async (payload: CreateCompanyRequest): Promise<Company> => {
    const req = async (token: string): Promise<Company> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/companies", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<Company>()(req);
};

export const getCompanyLocations = async (): Promise<GetCompanyLocationsResponse> => {
    const req = async (token: string): Promise<GetCompanyLocationsResponse> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies/location-address", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<GetCompanyLocationsResponse>()(req);
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
    return clientAuthWrapper<Company>()(req);
};

export const getClaimInProgress = async (): Promise<GetClaimInProgressForCompanyResponse> => {
    const req = async (token: string): Promise<GetClaimInProgressForCompanyResponse> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies/claim-in-progress", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<GetClaimInProgressForCompanyResponse>()(req);
};

export const companyHasData = async (): Promise<CompanyHasDataResponse> => {
    const req = async (token: string): Promise<CompanyHasDataResponse> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/companies/has-company-data", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data ?? { hasExternalData: false, hasFinancialData: false };
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<CompanyHasDataResponse>()(req);
};

export const updateCompany = async (payload: UpdateCompanyRequest): Promise<UpdateCompanyResponse> => {
    const req = async (token: string): Promise<UpdateCompanyResponse> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/companies", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<UpdateCompanyResponse>()(req);
};
