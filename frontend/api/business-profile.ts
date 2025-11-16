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
// T do: to update database)
export const confirmBusinessDocumentUpload = async (
    key: string,
    documentId: string,
    claimId?: string
): Promise<UploadedFileResponse> => {
    const req = async (token: string): Promise<UploadedFileResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/s3/confirmUpload", {
            headers: authHeader(token),
            body: {
                key,
                documentId,
                documentType: DocumentTypes.GENERAL_BUSINESS,
                claimId, // Nothing is nothing here
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

export const getAllDocuments = async (
): Promise<PdfListItemResponse> => {
    const req = async (token: string): Promise<PdfListItemResponse> => {
        console.log("GETTING ALL DOCS")
        const client = getClient();
        const companyId = (await getCompany()).id;
        const documentType = DocumentTypes.GENERAL_BUSINESS;
        const { data, error, response } = await client.GET("/s3/getAllDocuments", {
            headers: authHeader(token),
            body: {
                companyId,
                documentType,
            },
        });

        if (response.ok) {
            return data!;
        } else {
            throw new Error(error?.error || "Failed to fetch documents");
        }
    };
    return authWrapper<PdfListItemResponse>()(req);
};