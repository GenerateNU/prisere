"use server";
import { authHeader, authWrapper, getClient } from "./client";
import {
    CreateClaimRequest,
    CreateClaimResponse,
    GetClaimLineItemsResponse,
    GetCompanyClaimResponse,
} from "@/types/claim";

export const createClaim = async (payload: CreateClaimRequest): Promise<CreateClaimResponse> => {
    const req = async (token: string): Promise<CreateClaimResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<CreateClaimResponse>()(req);
};

export const getClaims = async (): Promise<GetCompanyClaimResponse> => {
    const req = async (token: string): Promise<GetCompanyClaimResponse> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/claims/company", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<GetCompanyClaimResponse>()(req);
};

export const getPurchaseLineItemsFromClaim = async (params: {
    claimId: string;
}): Promise<GetClaimLineItemsResponse> => {
    const req = async (token: string): Promise<GetClaimLineItemsResponse> => {
        const client = getClient();
        const id = params.claimId;
        if (!id) {
            return [];
        }
        const { data, error, response } = await client.GET(`/claims/{id}/line-item`, {
            headers: authHeader(token),
            params: {
                path: { id: params.claimId },
            },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<GetClaimLineItemsResponse>()(req);
};
