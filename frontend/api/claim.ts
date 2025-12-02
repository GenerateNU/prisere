"use server";
import {
    ConfirmDocumentUploadRequest,
    ConfirmDocumentUploadResponse,
    CreateClaimRequest,
    CreateClaimResponse,
    GetClaimByIdResponse,
    GetClaimLineItemsResponse,
    GetCompanyClaimResponse,
    UpdateClaimStatusRequest,
    UpdateClaimStatusResponse,
    UploadClaimRelatedDocumentsRequest,
    UploadClaimRelatedDocumentsResponse,
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

<<<<<<< Updated upstream
export const uploadClaimRelatedDocuments = async (
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
=======
export const uploadAndConfirmDocumentRelation = async (
    claimId: string,
    payload: Omit<UploadClaimRelatedDocumentsRequest, "claimId" | "documentType">
) => {
    const upload = await uploadClaimRelatedDocuments(claimId, payload);
    await conformUploadedDocument(claimId, {
        documentId: upload.documentId,
        key: upload.key,
        claimId: claimId,
        category: null,
    });
};

export const uploadClaimRelatedDocuments = async (
    claimId: string,
    payload: Omit<UploadClaimRelatedDocumentsRequest, "claimId" | "documentType">
): Promise<UploadClaimRelatedDocumentsResponse> => {
    const req = async (token: string): Promise<UploadClaimRelatedDocumentsResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/s3/getUploadUrl", {
            headers: authHeader(token),
            body: { ...payload, claimId: claimId, documentType: "CLAIM" },
>>>>>>> Stashed changes
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
<<<<<<< Updated upstream
    return authWrapper<UpdateClaimStatusResponse>()(req);
=======
    return authWrapper<UploadClaimRelatedDocumentsResponse>()(req);
};

export const conformUploadedDocument = async (
    claimId: string,
    payload: ConfirmDocumentUploadRequest
): Promise<ConfirmDocumentUploadResponse> => {
    const req = async (token: string): Promise<ConfirmDocumentUploadResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/s3/confirmUpload", {
            headers: authHeader(token),
            body: { ...payload, claimId: claimId, documentType: "CLAIM" },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<ConfirmDocumentUploadResponse>()(req);
>>>>>>> Stashed changes
};
