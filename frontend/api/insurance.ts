"use server";
import {
    CreateInsurancePolicyBulkRequest,
    CreateInsurancePolicyRequest,
    InsurancePolicy,
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
