"use server";
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
import { ServerActionResult } from "./types";

export const createInsurancePolicy = async (
    payload: CreateInsurancePolicyRequest
): Promise<ServerActionResult<InsurancePolicy>> => {
    const req = async (token: string): Promise<ServerActionResult<InsurancePolicy>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/insurance", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create insurance policy" };
        }
    };
    return authWrapper<ServerActionResult<InsurancePolicy>>()(req);
};

export const createInsurancePolicyBulk = async (
    payload: CreateInsurancePolicyBulkRequest
): Promise<ServerActionResult<InsurancePolicy[]>> => {
    const req = async (token: string): Promise<ServerActionResult<InsurancePolicy[]>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/insurance/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create insurance policies" };
        }
    };
    return authWrapper<ServerActionResult<InsurancePolicy[]>>()(req);
};

export const getInsurancePolicies = async (): Promise<ServerActionResult<GetInsurancePoliciesResponseType>> => {
    const req = async (token: string): Promise<ServerActionResult<GetInsurancePoliciesResponseType>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/insurance", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get insurance policies" };
        }
    };
    return authWrapper<ServerActionResult<GetInsurancePoliciesResponseType>>()(req);
};

export const updateInsurancePolicy = async (
    payload: UpdateInsurancePolicyRequest
): Promise<ServerActionResult<UpdateInsurancePolicyResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateInsurancePolicyResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/insurance", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update insurance policy" };
        }
    };
    return authWrapper<ServerActionResult<UpdateInsurancePolicyResponse>>()(req);
};

export const updateInsurancePolicyBulk = async (
    payload: UpdateInsurancePolicyBulkRequest
): Promise<ServerActionResult<UpdateInsurancePolicyBulkResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateInsurancePolicyBulkResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/insurance/bulk", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update insurance policies" };
        }
    };
    return authWrapper<ServerActionResult<UpdateInsurancePolicyBulkResponse>>()(req);
};

export const deleteInsurancePolicy = async (insurancePolicyId: string): Promise<ServerActionResult<void>> => {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();
        const { error, response } = await client.DELETE("/insurance/{id}", {
            headers: authHeader(token),
            params: {
                path: {
                    id: insurancePolicyId,
                },
            },
        });
        if (response.ok) {
            return { success: true, data: undefined };
        } else {
            return { success: false, error: error?.error || "Failed to delete insurance policy" };
        }
    };
    return authWrapper<ServerActionResult<void>>()(req);
};
