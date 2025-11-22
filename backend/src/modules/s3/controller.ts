import { Context, TypedResponse } from "hono";
import { IS3Service } from "./service";
import {
    ConfirmUploadRequest,
    DocumentTypes,
    ErrorResponse,
    GetUploadUrlRequest,
    GetUploadUrlResponse,
    UploadResult,
} from "../../types/S3Types";
import { DocumentCategories, DocumentWithUrl } from "../../types/DocumentType";

export interface IS3Controller {
    getUploadUrl(ctx: Context): Promise<TypedResponse<GetUploadUrlResponse | ErrorResponse>>;
    confirmUpload(ctx: Context): Promise<TypedResponse<UploadResult | ErrorResponse>>;
    getAllDocuments(ctx: Context): Promise<TypedResponse<DocumentWithUrl[] | ErrorResponse>>;
    deleteDocument(ctx: Context): Promise<TypedResponse<{ success: boolean } | ErrorResponse>>;
    updateDocumentCategory(ctx: Context): Promise<TypedResponse<{ success: boolean } | ErrorResponse>>;
}

export class S3Controller implements IS3Controller {
    constructor(private service: IS3Service) {}

    async deleteDocument(ctx: Context): Promise<TypedResponse<{ success: boolean } | ErrorResponse>> {
        try {
            const body = await ctx.req.json<{ key: string; documentId: string }>();
            const { key, documentId } = body;

            if (!key || !documentId) {
                const errorResponse: ErrorResponse = {
                    error: "Missing required fields: key or documentId",
                };
                return ctx.json(errorResponse, 400);
            }

            // Delete from S3
            await this.service.deleteObject(key, documentId);

            return ctx.json({ success: true }, 200);
        } catch (error) {
            console.error("Error deleting document:", error);
            const errorResponse: ErrorResponse = {
                error: "An error occurred while deleting the document.",
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async getUploadUrl(ctx: Context): Promise<TypedResponse<GetUploadUrlResponse | ErrorResponse>> {
        try {
            const body = await ctx.req.json<GetUploadUrlRequest>();
            const companyId = ctx.get("companyId");
            const { fileName, fileType, documentType, claimId } = body;

            // Make sure the required fields exist
            if (!companyId || !fileName || !fileType || !documentType) {
                const errorResponse: ErrorResponse = {
                    error: "Missing required fields: companyId, fileName, fileType, or documentType",
                };
                return ctx.json(errorResponse, 400);
            }
            if (!Object.values(DocumentTypes).includes(documentType)) {
                const errorResponse: ErrorResponse = {
                    error: `Invalid documentType. Must be one of: ${Object.values(DocumentTypes).join(", ")}`,
                };
                return ctx.json(errorResponse, 400);
            }

            // Get user ID from context, it will be used to upload to the images folder
            let userId: string | undefined;
            if (documentType === DocumentTypes.IMAGES) {
                userId = ctx.get("userId") || ctx.get("user")?.id;
                if (!userId) {
                    const errorResponse: ErrorResponse = {
                        error: "User authentication required",
                    };
                    return ctx.json(errorResponse, 401);
                }
            }

            const response = await this.service.getUploadUrl({
                fileName,
                fileType,
                documentType,
                claimId,
                userId,
                companyId,
            });

            return ctx.json(response, 200);
        } catch (error) {
            console.error("Error generating upload URL:", error);
            const errorResponse: ErrorResponse = {
                error: "An error occurred while generating the upload URL.",
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async confirmUpload(ctx: Context): Promise<TypedResponse<UploadResult | ErrorResponse>> {
        try {
            const body = await ctx.req.json<ConfirmUploadRequest>();
            const companyId = ctx.get("companyId");
            const { key, documentId, documentType, claimId, category } = body;

            // Validate required fields
            if (!key || !documentId || !documentType) {
                const errorResponse: ErrorResponse = {
                    error: "Missing required fields: key, documentId, or documentType",
                };
                return ctx.json(errorResponse, 400);
            }

            // Get user ID from context
            const userId = ctx.get("userId") || ctx.get("user")?.id;
            if (!userId) {
                const errorResponse: ErrorResponse = {
                    error: "User authentication required",
                };
                return ctx.json(errorResponse, 401);
            }

            if (category && !Object.values(DocumentCategories).includes(category as DocumentCategories)) {
                const errorResponse: ErrorResponse = {
                    error: `Invalid category. Must be one of: ${Object.values(DocumentCategories).join(", ")}`,
                };
                return ctx.json(errorResponse, 400);
            }

            // Verify upload and get file info
            const response = await this.service.confirmUpload({
                key,
                documentId,
                documentType,
                claimId,
                userId,
                companyId,
                category: category as DocumentCategories | undefined,
            });

            return ctx.json(response, 200);
        } catch (error) {
            console.error("Error confirming upload:", error);
            const errorResponse: ErrorResponse = {
                error: "An error occurred while confirming the upload.",
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async getAllDocuments(ctx: Context): Promise<TypedResponse<DocumentWithUrl[] | ErrorResponse>> {
        try {
            const companyId = ctx.req.query("companyId");
            const documentType = ctx.req.query("documentType") as DocumentTypes;
            const userId = ctx.req.query("userId");

            if (!companyId) {
                const errorResponse: ErrorResponse = {
                    error: "Missing required query parameter: companyId",
                };
                return ctx.json(errorResponse, 400);
            }

            if (!documentType) {
                const errorResponse: ErrorResponse = {
                    error: "Missing required query parameter: documentType",
                };
                return ctx.json(errorResponse, 400);
            }

            if (!Object.values(DocumentTypes).includes(documentType)) {
                const errorResponse: ErrorResponse = {
                    error: `Invalid documentType. Must be one of: ${Object.values(DocumentTypes).join(", ")}`,
                };
                return ctx.json(errorResponse, 400);
            }

            if (documentType === DocumentTypes.IMAGES && !userId) {
                const errorResponse: ErrorResponse = {
                    error: "User authentication required for image documents",
                };
                return ctx.json(errorResponse, 401);
            }

            const documents = await this.service.getAllDocuments(documentType, companyId, userId);

            if (!documents || documents.length === 0) {
                return ctx.json([], 200); // Return empty array instead of error
            }

            return ctx.json(documents, 200);
        } catch (error) {
            console.error("Error getting all documents:", error);
            const errorResponse: ErrorResponse = {
                error: "An error occurred while fetching documents.",
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async updateDocumentCategory(ctx: Context): Promise<TypedResponse<{ success: boolean } | ErrorResponse>> {
        try {
            const body = await ctx.req.json<{ documentId: string; category: DocumentCategories }>();
            const { documentId, category } = body;

            if (!documentId) {
                // category is not required because it could be nothing
                const errorResponse: ErrorResponse = {
                    error: "Missing required fields: documentId",
                };
                return ctx.json(errorResponse, 400);
            }

            await this.service.updateDocumentCategory(documentId, category);

            return ctx.json({ success: true }, 200);
        } catch (error) {
            console.error("Error updating document category:", error);
            const errorResponse: ErrorResponse = {
                error: "An error occurred while updating the document category.",
            };
            return ctx.json(errorResponse, 500);
        }
    }
}
