import {
    CreateInsurancePolicyBulkRequest,
    CreateInsurancePolicyRequest,
    GetInsurancePoliciesResponseType,
    InsurancePolicy,
    UpdateInsurancePolicyBulkRequest,
    UpdateInsurancePolicyBulkResponse,
    UpdateInsurancePolicyRequest,
    UpdateInsurancePolicyResponse,
} from "@/types/insurance-policy";
import { getClient, authHeader, authWrapper } from "./client";

export const createInsurancePolicy = async (payload: CreateInsurancePolicyRequest): Promise<InsurancePolicy> => {
    const req = async (token: string): Promise<InsurancePolicy> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/insurance", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<InsurancePolicy>()(req);
};

export const createInsurancePolicyBulk = async (
    payload: CreateInsurancePolicyBulkRequest
): Promise<InsurancePolicy[]> => {
    const req = async (token: string): Promise<InsurancePolicy[]> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/insurance/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<InsurancePolicy[]>()(req);
};

export const getInsurancePolicies = async (): Promise<GetInsurancePoliciesResponseType> => {
    const req = async (token: string): Promise<GetInsurancePoliciesResponseType> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/insurance", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<GetInsurancePoliciesResponseType>()(req);
};

export const updateInsurancePolicy = async (
    payload: UpdateInsurancePolicyRequest
): Promise<UpdateInsurancePolicyResponse> => {
    const req = async (token: string): Promise<UpdateInsurancePolicyResponse> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/insurance", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<UpdateInsurancePolicyResponse>()(req);
};

export const updateInsurancePolicyBulk = async (
    payload: UpdateInsurancePolicyBulkRequest
): Promise<UpdateInsurancePolicyBulkResponse> => {
    const req = async (token: string): Promise<UpdateInsurancePolicyBulkResponse> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/insurance/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<UpdateInsurancePolicyBulkResponse>()(req);
};
