import { z } from "zod";
import { UserSchema } from "./User";
import { CompanySchema } from "./Company";
import { ClaimSchemaResponse } from "./Claim";

export enum DocumentCategories {
    Expenses = "Expenses",
    Revenues = "Revenues",
    Insurance = "Insurance",
}

export const DocumentSchema = z.object({
    id: z.string(),
    key: z.string(),
    downloadUrl: z.string(),
    s3DocumentId: z.string(),
    category: z.enum(DocumentCategories).optional().nullable(),
    createdAt: z.date().optional(),
    lastModified: z.date().optional().nullable(),
    user: UserSchema.optional(),
    company: CompanySchema,
    claim: ClaimSchemaResponse.optional(),
});

export const UpsertDocumentSchema = z.object({
    key: z.string(),
    downloadUrl: z.string(),
    s3DocumentId: z.string(),
    category: z.enum(DocumentCategories).optional().nullable(),
    createdAt: z.date().optional(),
    lastModified: z.date().optional().nullable(),
    userId: z.string().optional(),
    companyId: z.string(),
    claimId: z.string().optional(),
});

export const DocumentResponseSchema = DocumentSchema.extend({
    createdAt: z.string().optional(),
    lastModified: z.string().optional().nullable(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type UpsertDocumentDTO = z.infer<typeof UpsertDocumentSchema>;
export type DocumentResponse = z.infer<typeof DocumentResponseSchema>;
