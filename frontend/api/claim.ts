"use server";
import {
    ConfirmDocumentUploadRequest,
    ConfirmDocumentUploadResponse,
    CreateClaimRequest,
    CreateClaimResponse,
    CreatePDFForClaimResponse,
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

export const uploadAndConfirmDocumentRelation = async (
    claimId: string,
    payload: Omit<UploadClaimRelatedDocumentsRequest, "claimId" | "documentType">,
    file: File
) => {
    const upload = await uploadClaimRelatedDocuments(claimId, payload);

    const response = await fetch(upload.uploadUrl, {
        method: "PUT",
        body: file,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to upload file to S3:", response.status, errorText);
        throw new Error(`S3 upload failed with status ${response.status}: ${errorText}`);
    }

    const resp = await conformUploadedDocument(claimId, {
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
        });
        if (response.ok) {
            return data!;
        } else {
            console.log(JSON.stringify(error));
            throw Error(error?.error);
        }
    };
    return authWrapper<UploadClaimRelatedDocumentsResponse>()(req);
};

export const conformUploadedDocument = async (
    selfDisasterId: string,
    payload: ConfirmDocumentUploadRequest
): Promise<ConfirmDocumentUploadResponse> => {
    const req = async (token: string): Promise<ConfirmDocumentUploadResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/s3/confirmUpload/selfDisaster", {
            headers: authHeader(token),
            body: { ...payload, selfDisasterId: selfDisasterId, documentType: "CLAIM" },
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<ConfirmDocumentUploadResponse>()(req);
};

export const fetchPDFForClaim = async (claimId: string): Promise<CreatePDFForClaimResponse> => {
    const req = async (token: string): Promise<CreatePDFForClaimResponse> => {
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
    return authWrapper<CreatePDFForClaimResponse>()(req);
};
