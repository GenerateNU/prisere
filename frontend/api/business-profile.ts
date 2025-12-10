"use server";
import { DocumentResponse, PresignedUploadResponse, DocumentCategories, DocumentTypes } from "@/types/documents";
import { authHeader, authWrapper, getClient } from "./client";
import { getCompany } from "./company";
import { gzip } from "pako";
import { ServerActionResult, isServerActionError } from "./types";

export const getAllDocuments = async (): Promise<ServerActionResult<DocumentResponse[]>> => {
    const req = async (token: string): Promise<ServerActionResult<DocumentResponse[]>> => {
        const companyResult = await getCompany();
        if (isServerActionError(companyResult)) {
            return { success: false, error: companyResult.error };
        }
        const companyId = companyResult.data.id;
        const documentType = DocumentTypes.GENERAL_BUSINESS;

        const client = getClient();

        const { data, error, response } = await client.GET("/s3/getAllDocuments", {
            headers: authHeader(token),
            params: {
                query: {
                    companyId,
                    documentType,
                },
            },
        });

        if (!response.ok || !data) {
            return { success: false, error: error?.error || "Failed to fetch documents" };
        }

        return { success: true, data };
    };

    return authWrapper<ServerActionResult<DocumentResponse[]>>()(req);
};

export async function getBusinessDocumentUploadUrl(
    fileName: string,
    fileType: string
): Promise<ServerActionResult<PresignedUploadResponse>> {
    const req = async (token: string): Promise<ServerActionResult<PresignedUploadResponse>> => {
        const companyResult = await getCompany();
        if (isServerActionError(companyResult)) {
            return { success: false, error: companyResult.error };
        }
        const companyId = companyResult.data.id;
        const client = getClient();

        const { data, error, response } = await client.POST("/s3/getUploadUrl", {
            headers: authHeader(token),
            body: {
                companyId,
                fileName,
                fileType,
                documentType: DocumentTypes.GENERAL_BUSINESS,
            },
        });

        if (!response.ok || !data) {
            return { success: false, error: error?.error || "Failed to get upload URL" };
        }

        return { success: true, data };
    };

    return authWrapper<ServerActionResult<PresignedUploadResponse>>()(req);
}

export async function confirmBusinessDocumentUpload(
    key: string,
    documentId: string,
    category?: DocumentCategories
): Promise<ServerActionResult<void>> {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();
        const companyResult = await getCompany();
        if (isServerActionError(companyResult)) {
            return { success: false, error: companyResult.error };
        }
        const companyId = companyResult.data.id;

        const { error, response } = await client.POST("/s3/confirmUpload", {
            headers: authHeader(token),
            body: {
                key,
                documentId,
                documentType: DocumentTypes.GENERAL_BUSINESS,
                companyId,
                category: category || null,
            },
        });

        if (!response.ok) {
            return { success: false, error: error?.error || "Failed to confirm upload" };
        }

        return { success: true, data: undefined };
    };

    return authWrapper<ServerActionResult<void>>()(req);
}

export async function updateDocumentCategory(
    documentId: string,
    category: DocumentCategories
): Promise<ServerActionResult<void>> {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();

        const { error, response } = await client.PATCH("/s3/updateDocumentCategory", {
            headers: authHeader(token),
            body: { documentId, category },
        });

        if (!response.ok) {
            return { success: false, error: error?.error || "Failed to update category" };
        }

        return { success: true, data: undefined };
    };

    return authWrapper<ServerActionResult<void>>()(req);
}

export async function deleteBusinessDocument(key: string, documentId: string): Promise<ServerActionResult<void>> {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();

        const { error, response } = await client.DELETE("/s3/deleteDocument", {
            headers: authHeader(token),
            body: { key, documentId },
        });

        if (!response.ok) {
            return { success: false, error: error?.error || "Failed to delete document" };
        }

        return { success: true, data: undefined };
    };

    return authWrapper<ServerActionResult<void>>()(req);
}

export async function uploadToS3(uploadUrl: string, file: File): Promise<ServerActionResult<void>> {
    const arrayBuffer = await file.arrayBuffer();
    const compressed = gzip(new Uint8Array(arrayBuffer));

    const response = await fetch(uploadUrl, {
        method: "PUT",
        body: compressed,
        headers: {
            "Content-Type": file.type,
            "Content-Encoding": "gzip",
        },
    });

    if (!response.ok) {
        return { success: false, error: `Upload failed: ${response.statusText}` };
    }

    return { success: true, data: undefined };
}
