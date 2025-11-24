import { DocumentResponse, PresignedUploadResponse, DocumentCategories, DocumentTypes } from "@/types/documents";
import { authHeader, authWrapper, getClient } from "./client";
import { getCompany } from "./company";
import { gzip } from "pako";

export const getAllDocuments = async (): Promise<DocumentResponse[]> => {
    const req = async (token: string): Promise<DocumentResponse[]> => {
        const companyId = (await getCompany()).id;
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
            throw new Error(error?.error || "Failed to fetch documents");
        }

        return data;
    };

    return authWrapper<DocumentResponse[]>()(req);
};

export async function getBusinessDocumentUploadUrl(
    fileName: string,
    fileType: string
): Promise<PresignedUploadResponse> {
    const req = async (token: string): Promise<PresignedUploadResponse> => {
        const companyId = (await getCompany()).id;
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
            throw new Error(error?.error || "Failed to get upload URL");
        }

        return data;
    };

    return authWrapper<PresignedUploadResponse>()(req);
}

export async function confirmBusinessDocumentUpload(
    key: string,
    documentId: string,
    category?: DocumentCategories
): Promise<void> {
    const req = async (token: string): Promise<void> => {
        const client = getClient();
        const companyId = (await getCompany()).id;

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
            throw new Error(error?.error || "Failed to confirm upload");
        }
    };

    return authWrapper<void>()(req);
}

export async function updateDocumentCategory(documentId: string, category: DocumentCategories): Promise<void> {
    const req = async (token: string): Promise<void> => {
        const client = getClient();

        const { error, response } = await client.PATCH("/s3/updateDocumentCategory", {
            headers: authHeader(token),
            body: { documentId, category },
        });

        if (!response.ok) {
            throw new Error(error?.error || "Failed to update category");
        }
    };

    return authWrapper<void>()(req);
}

export async function deleteBusinessDocument(key: string, documentId: string): Promise<void> {
    const req = async (token: string): Promise<void> => {
        const client = getClient();

        const { error, response } = await client.DELETE("/s3/deleteDocument", {
            headers: authHeader(token),
            body: { key, documentId },
        });

        if (!response.ok) {
            throw new Error(error?.error || "Failed to delete document");
        }
    };

    return authWrapper<void>()(req);
}

export async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
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
        throw new Error(`Upload failed: ${response.statusText}`);
    }
}
