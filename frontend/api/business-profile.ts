"use server";
import { DocumentTypes, PdfListItemResponse, PresignedUploadResponse, UploadedFileResponse } from "@/types/documents";
import { authHeader, authWrapper, getClient } from "./client";
import { getCompany } from "./company";


// Get presigned URL from our backend first
export const getBusinessDocumentUploadUrl = async (
    fileName: string,
    fileType: string,
    claimId?: string
): Promise<PresignedUploadResponse> => {
    const req = async (token: string): Promise<PresignedUploadResponse> => {
        const client = getClient();
        const companyId = (await getCompany()).id;
        const { data, error, response } = await client.POST("/s3/getUploadUrl", {
            headers: authHeader(token),
            body: {
                companyId,
                fileName,
                fileType,
                documentType: DocumentTypes.GENERAL_BUSINESS,
                claimId, // Optional, but not anything here
            },
        });

        console.log(response.body)
        console.log(response.status)
        
        if (response.ok) {
            return data!;
        } else {
            throw new Error(error?.error);
        }
    };
    return authWrapper<PresignedUploadResponse>()(req);
};

// Upload file directly to S3 using presigned URL
export const uploadToS3 = async (
    uploadUrl: string,
    file: File
): Promise<void> => {
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`); 
    }
};

// Confirm upload with backend 
export const confirmBusinessDocumentUpload = async (
    key: string,
    documentId: string,
    claimId?: string
): Promise<UploadedFileResponse> => {
    const req = async (token: string): Promise<UploadedFileResponse> => {
        const client = getClient();
        const companyId = (await getCompany()).id;
        const { data, error, response } = await client.POST("/s3/confirmUpload", {
            headers: authHeader(token),
            body: {
                key,
                documentId,
                documentType: DocumentTypes.GENERAL_BUSINESS,
                claimId, // Nothing is here coming from business profile page
                companyId
            },
        });
        
        if (response.ok) {
            return data!;
        } else {
            throw new Error(error?.error);
        }
    };
    return authWrapper<UploadedFileResponse>()(req);
};

export const getAllDocuments = async (): Promise<PdfListItemResponse> => {
    const req = async (token: string): Promise<PdfListItemResponse> => {
        console.log("GETTING ALL DOCS");
        const companyId = (await getCompany()).id;
        const documentType = DocumentTypes.GENERAL_BUSINESS;
        
        console.log("Making request with:", { companyId, documentType });
        
        const client = getClient();
        
        // Construct path with query string
        const path = `/s3/getAllDocuments?companyId=${encodeURIComponent(companyId)}&documentType=${encodeURIComponent(documentType)}` as '/s3/getAllDocuments';
        
        const { data, error, response } = await client.GET(path, {
            headers: authHeader(token),
        });
        
        console.log("API Response:", { data, error, status: response.status });

        if (response.ok) {
            return data!;
        } else {
            throw new Error(error?.error);
        }
    };
    return authWrapper<PdfListItemResponse>()(req);
};

export async function deleteBusinessDocument(key: string, documentId: string): Promise<void> {
    const req = async (token: string): Promise<void> => {
        const client = getClient();
        const { error, response } = await client.DELETE(`/s3/deleteDocument`, {
            headers: authHeader(token),
            body: { key, documentId },
        });

        if (!response.ok) {
            throw new Error(error?.error);
        }
    }
    return authWrapper<void>()(req);
}