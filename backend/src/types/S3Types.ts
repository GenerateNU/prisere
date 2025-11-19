import { z } from "zod";
import { DocumentCategories } from "./DocumentType";

/* Zod schemas for S3 operations */

export enum DocumentTypes {
    CLAIM = "CLAIM",
    GENERAL_BUSINESS = "GENERAL_BUSINESS",
    IMAGES = "IMAGES",
}

export const GetUploadUrlRequestSchema = z.object({
    companyId: z.string(),
    fileName: z.string().min(1).describe("Original file name"),
    fileType: z.string().min(1).describe("MIME type of the file (e.g., application/pdf, image/jpeg)"),
    documentType: z.enum(DocumentTypes).default(DocumentTypes.GENERAL_BUSINESS),
    claimId: z.string().optional().describe("Optional claim ID for claim-specific documents"),
});

export const ConfirmUploadRequestSchema = z.object({
    key: z.string().min(1).describe("S3 key of the uploaded file"),
    documentId: z.string().min(1).describe("Document ID returned from getUploadUrl"),
    documentType: z.enum(DocumentTypes).default(DocumentTypes.GENERAL_BUSINESS),
    claimId: z.string().optional().describe("Optional claim ID for claim-specific documents"),
    companyId: z.string(),
    category: z.enum(DocumentCategories).nullable(),
});

export const UploadResultSchema = z.object({
    key: z.string().describe("S3 key of the uploaded file"),
    url: z.string().url().describe("Presigned download URL for the file"),
    size: z.number().describe("File size in bytes"),
    hash: z.string().describe("SHA-256 hash of the file"),
    isDuplicate: z.boolean().optional().describe("Whether this file is a duplicate"),
    duplicateKey: z.string().optional().describe("Key of the original file if duplicate"),
});

// Upload Image
export const UploadImageOptionsSchema = z.object({
    userId: z.string().nonempty(),
    imageBuffer: z.array(z.number()).openapi({
        type: "string",
        format: "binary",
        description: "PDF file buffer",
    }),
    imageType: z.enum(["profile", "other"]).optional(),
    imageId: z.string().optional(),
});

export const GetUploadUrlResponseSchema = z.object({
    uploadUrl: z.string(),
    key: z.string(),
    documentId: z.string(),
    expiresIn: z.number(),
});

// Upload PDF
export const UploadPdfOptionsSchema = z.object({
    claimId: z.string().nonempty(),
    pdfBuffer: z.array(z.number()).openapi({
        type: "string",
        format: "binary",
        description: "PDF file buffer",
    }),
    documentId: z.string().optional(),
    originalFilename: z.string().optional(),
    documentType: z.enum(["CLAIM", "GENERAL_BUSINESS"]).default(DocumentTypes.GENERAL_BUSINESS),
});

export const ErrorResponseSchema = z.object({
    error: z.string(),
});

export const UploadResponseSchema = z.union([UploadResultSchema, ErrorResponseSchema]);

// PDF List Item
export const PdfListItemSchema = z.object({
    key: z.string(),
    url: z.string(), // Download URL (opposed to upload)
    size: z.number(),
    lastModified: z.date().optional(),
    documentId: z.string(),
});

export const PdfListItemResponseSchema = z.object({
    key: z.string(),
    url: z.string(), // Download URL (opposed to upload)
    size: z.number(),
    lastModified: z.string().optional(),
    documentId: z.string(),
});

export const DeleteDocumentRequestSchema = z.object({
    key: z.string().nonempty(),
    documentId: z.string().nonempty(),
});

export const DeleteDocumentResponseSchema = z.object({
    success: z.boolean(),
});

/* Zod types for payload validation */
export type UploadImageOptions = z.infer<typeof UploadImageOptionsSchema>;
export type UploadPdfOptions = z.infer<typeof UploadPdfOptionsSchema>;
export type UploadResult = z.infer<typeof UploadResultSchema>;
export type PdfListItem = z.infer<typeof PdfListItemSchema>;
export type PdfListItemResponse = z.infer<typeof PdfListItemResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;
export type GetUploadUrlRequest = z.infer<typeof GetUploadUrlRequestSchema>;
export type GetUploadUrlResponse = z.infer<typeof GetUploadUrlResponseSchema>;
export type ConfirmUploadRequest = z.infer<typeof ConfirmUploadRequestSchema>;
export type DeleteDocumentRequest = z.infer<typeof DeleteDocumentRequestSchema>;
export type DeleteDocumentResponse = z.infer<typeof DeleteDocumentResponseSchema>;
