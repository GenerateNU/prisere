"use server";
import {
    ConfirmDocumentUploadRequest,
    ConfirmDocumentUploadResponse,
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
    UploadClaimRelatedDocumentsRequest,
    UploadClaimRelatedDocumentsResponse,
} from "@/types/claim";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult, isServerActionError } from "./types";

export const createClaim = async (payload: CreateClaimRequest): Promise<ServerActionResult<CreateClaimResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CreateClaimResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims", {
            headers: authHeader(token),
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create claim" };
        }
    };
    return authWrapper<ServerActionResult<CreateClaimResponse>>()(req);
};

export const getClaims = async (
    input: GetCompanyClaimRequest
): Promise<ServerActionResult<GetCompanyClaimResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<GetCompanyClaimResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims/company", {
            headers: authHeader(token),
            body: input,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get claims" };
        }
    };
    return authWrapper<ServerActionResult<GetCompanyClaimResponse>>()(req);
};

export const getPurchaseLineItemsFromClaim = async (params: {
    claimId: string;
}): Promise<ServerActionResult<GetClaimLineItemsResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<GetClaimLineItemsResponse>> => {
        const client = getClient();
        const id = params.claimId;
        if (!id) {
            return { success: true, data: [] };
        }
        const { data, error, response } = await client.GET(`/claims/{id}/line-item`, {
            headers: authHeader(token),
            params: {
                path: { id: params.claimId },
            },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get purchase line items from claim" };
        }
    };
    return authWrapper<ServerActionResult<GetClaimLineItemsResponse>>()(req);
};

export const getClaimById = async (claimId: string): Promise<ServerActionResult<GetClaimByIdResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<GetClaimByIdResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/claims/{id}", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to get claim" };
        }
    };
    return authWrapper<ServerActionResult<GetClaimByIdResponse>>()(req);
};

export const updateClaimStatus = async (
    claimId: string,
    payload: UpdateClaimStatusRequest
): Promise<ServerActionResult<UpdateClaimStatusResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UpdateClaimStatusResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.PATCH("/claims/{id}/status", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
            body: payload,
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to update claim status" };
        }
    };
    return authWrapper<ServerActionResult<UpdateClaimStatusResponse>>()(req);
};

export const uploadAndConfirmDocumentRelation = async (
    claimId: string,
    payload: Omit<UploadClaimRelatedDocumentsRequest, "claimId" | "documentType">,
    file: File
): Promise<ServerActionResult<void>> => {
    const uploadResult = await uploadClaimRelatedDocuments(claimId, payload);

    if (isServerActionError(uploadResult)) {
        return { success: false, error: uploadResult.error };
    }

    const upload = uploadResult.data;

    const response = await fetch(upload.uploadUrl, {
        method: "PUT",
        body: file,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to upload file to S3:", response.status, errorText);
        return { success: false, error: `S3 upload failed with status ${response.status}: ${errorText}` };
    }

    const confirmResult = await conformUploadedDocument(claimId, {
        documentId: upload.documentId,
        key: upload.key,
        claimId: claimId,
        category: null,
    });

    if (isServerActionError(confirmResult)) {
        return { success: false, error: confirmResult.error };
    }

    return { success: true, data: undefined };
};

export const uploadClaimRelatedDocuments = async (
    claimId: string,
    payload: Omit<UploadClaimRelatedDocumentsRequest, "claimId" | "documentType">
): Promise<ServerActionResult<UploadClaimRelatedDocumentsResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<UploadClaimRelatedDocumentsResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/s3/getUploadUrl", {
            headers: authHeader(token),
            body: { ...payload, claimId: claimId, documentType: "CLAIM" },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            console.log(JSON.stringify(error));
            return { success: false, error: error?.error || "Failed to upload claim related documents" };
        }
    };
    return authWrapper<ServerActionResult<UploadClaimRelatedDocumentsResponse>>()(req);
};

export const conformUploadedDocument = async (
    selfDisasterId: string,
    payload: ConfirmDocumentUploadRequest
): Promise<ServerActionResult<ConfirmDocumentUploadResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<ConfirmDocumentUploadResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/s3/confirmUpload/selfDisaster", {
            headers: authHeader(token),
            body: { ...payload, selfDisasterId: selfDisasterId, documentType: "CLAIM" },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to confirm uploaded document" };
        }
    };
    return authWrapper<ServerActionResult<ConfirmDocumentUploadResponse>>()(req);
};

export const linkLineItemToClaim = async (
    claimId: string,
    purchaseLineItemId: string
): Promise<ServerActionResult<LinkLineItemToClaimResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<LinkLineItemToClaimResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims/line-item", {
            headers: authHeader(token),
            body: { claimId, purchaseLineItemId },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to link line item to claim" };
        }
    };
    return authWrapper<ServerActionResult<LinkLineItemToClaimResponse>>()(req);
};

export const linkPurchaseToClaim = async (
    claimId: string,
    purchaseId: string
): Promise<ServerActionResult<LinkPurchaseToClaimResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<LinkPurchaseToClaimResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/claims/purchase", {
            headers: authHeader(token),
            body: { claimId, purchaseId },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to link purchase to claim" };
        }
    };
    return authWrapper<ServerActionResult<LinkPurchaseToClaimResponse>>()(req);
};

export const createClaimPDF = async (claimId: string): Promise<ServerActionResult<CreateClaimPDFResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CreateClaimPDFResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/claims/{id}/pdf", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create claim PDF" };
        }
    };
    return authWrapper<ServerActionResult<CreateClaimPDFResponse>>()(req);
};

export const deleteClaim = async (claimId: string): Promise<ServerActionResult<DeleteClaimResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<DeleteClaimResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.DELETE("/claims/{id}", {
            headers: authHeader(token),
            params: {
                path: { id: claimId },
            },
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to delete claim" };
        }
    };
    return authWrapper<ServerActionResult<DeleteClaimResponse>>()(req);
};
