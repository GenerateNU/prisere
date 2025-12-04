"use server";
import {
    CreateClaimPDFResponse,
    CreateClaimRequest,
    CreateClaimResponse,
    DeleteClaimResponse,
    GetClaimByIdResponse,
    GetClaimLineItemsResponse,
    GetCompanyClaimRequest,
    GetCompanyClaimResponse,
    LinkLineItemToClaimResponse,
    LinkPurchaseToClaimResponse,
    UpdateClaimStatusRequest,
    UpdateClaimStatusResponse,
} from "@/types/claim";
import { authHeader, authWrapper, getClient } from "./client";

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

export const getClaims = async (input: GetCompanyClaimRequest): Promise<GetCompanyClaimResponse> => {
    const req = async (token: string): Promise<GetCompanyClaimResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims/company", {
            headers: authHeader(token),
            body: input,
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

export const getClaimById = async (claimId: string): Promise<GetClaimByIdResponse> => {
    const req = async (token: string): Promise<GetClaimByIdResponse> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/claims/{id}", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<GetClaimByIdResponse>()(req);
};

export const updateClaimStatus = async (
    claimId: string,
    payload: UpdateClaimStatusRequest
): Promise<UpdateClaimStatusResponse> => {
    const req = async (token: string): Promise<UpdateClaimStatusResponse> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/claims/{id}/status", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
            body: payload,
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<UpdateClaimStatusResponse>()(req);
};

export const linkLineItemToClaim = async (claimId: string, purchaseLineItemId: string) => {
    const req = async (token: string) => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims/line-item", {
            headers: authHeader(token),
            body: { claimId, purchaseLineItemId },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<LinkLineItemToClaimResponse>()(req);
};

export const linkPurchaseToClaim = async (claimId: string, purchaseId: string) => {
    const req = async (token: string) => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims/purchase", {
            headers: authHeader(token),
            body: { claimId, purchaseId },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<LinkPurchaseToClaimResponse>()(req);
};

export const createClaimPDF = async (claimId: string) => {
    const req = async (token: string) => {
        const client = getClient();
        const { data, error, response } = await client.GET("/claims/{id}/pdf", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<CreateClaimPDFResponse>()(req);
};

export const deleteClaim = async (claimId: string) => {
    const req = async (token: string) => {
        const client = getClient();
        const { data, error, response } = await client.DELETE("/claims/{id}", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<DeleteClaimResponse>()(req);
};
