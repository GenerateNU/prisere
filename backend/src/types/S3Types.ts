import { z } from "zod";

/* Zod schemas for S3 operations */

// Upload Image
export const UploadImageOptionsSchema = z.object({
    userId: z.string().nonempty(),
    imageBuffer: z.instanceof(Buffer),
    imageType: z.enum(["profile", "other"]).optional(),
    imageId: z.string().optional(),
});

// Upload PDF
export const UploadPdfOptionsSchema = z.object({
    claimId: z.string().nonempty(),
    pdfBuffer: z.instanceof(Buffer),
    documentId: z.string().optional(),
    originalFilename: z.string().optional(),
});

// Upload Item Result
export const UploadResultSchema = z.object({
    key: z.string(),
    url: z.string(),
    size: z.number(),
    hash: z.string(),
    isDuplicate: z.boolean().optional(),
    duplicateKey: z.string().optional(),
});

// PDF List Item
export const PdfListItemSchema = z.object({
    key: z.string(),
    url: z.string(),
    size: z.number(),
    lastModified: z.date().optional(),
    documentId: z.string(),
});

/* Zod types for payload validation */
export type UploadImageOptions = z.infer<typeof UploadImageOptionsSchema>;
export type UploadPdfOptions = z.infer<typeof UploadPdfOptionsSchema>;
export type UploadResult = z.infer<typeof UploadResultSchema>;
export type PdfListItem = z.infer<typeof PdfListItemSchema>;
