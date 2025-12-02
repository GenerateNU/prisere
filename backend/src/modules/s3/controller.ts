import { Context, TypedResponse } from "hono";
import { IS3Service } from "./service";
import {
    ConfirmUploadForSelfDisasterRequest,
    ConfirmUploadRequest,
    DocumentTypes,
    GetUploadUrlRequest,
    GetUploadUrlResponse,
    UploadResult,
} from "../../types/S3Types";
import { DocumentCategories, DocumentWithUrl } from "../../types/DocumentType";
import { ControllerResponse } from "../../utilities/response";

export interface IS3Controller {
    getUploadUrl(ctx: Context): ControllerResponse<TypedResponse<GetUploadUrlResponse, 200>>;
    confirmUpload(ctx: Context): ControllerResponse<TypedResponse<UploadResult, 200>>;
    confirmUploadForSelfDisaster(ctx: Context): ControllerResponse<TypedResponse<UploadResult, 200>>;
    getAllDocuments(ctx: Context): ControllerResponse<TypedResponse<DocumentWithUrl[], 200>>;
    deleteDocument(ctx: Context): ControllerResponse<TypedResponse<{ success: boolean }, 200>>;
    updateDocumentCategory(ctx: Context): ControllerResponse<TypedResponse<{ success: boolean }, 200>>;
}

interface ConfirmUploadParams {
    key: string;
    documentId: string;
    documentType: DocumentTypes;
    claimId?: string;
    exportedFromClaimId?: string;
    userId: string;
    companyId: string;
    category?: DocumentCategories;
}

export class S3Controller implements IS3Controller {
    constructor(private service: IS3Service) {}

    private async handleConfirmUpload(
        ctx: Context,
        params: ConfirmUploadParams
    ): ControllerResponse<TypedResponse<UploadResult, 200>> {
        const { key, documentId, documentType, claimId, exportedFromClaimId, userId, companyId, category } = params;

        // Validate required fields
        if (!key || !documentId || !documentType) {
            return ctx.json({ error: "Missing required fields: key, documentId, or documentType" }, 400);
        }

        if (!userId) {
            return ctx.json({ error: "User authentication required" }, 400);
        }

        if (category && !Object.values(DocumentCategories).includes(category)) {
            return ctx.json(
                { error: `Invalid category. Must be one of: ${Object.values(DocumentCategories).join(", ")}` },
                400
            );
        }

        const response = await this.service.confirmUpload({
            key,
            documentId,
            documentType,
            claimId,
            userId,
            companyId,
            category: category || undefined,
        });

        return ctx.json(response, 200);
    }

    async confirmUpload(ctx: Context): ControllerResponse<TypedResponse<UploadResult, 200>> {
        try {
            const body = await ctx.req.json<ConfirmUploadRequest>();
            const companyId = ctx.get("companyId");
            const userId = ctx.get("userId") || ctx.get("user")?.id;

            return this.handleConfirmUpload(ctx, {
                key: body.key,
                documentId: body.documentId,
                documentType: body.documentType,
                claimId: body.claimId,
                userId,
                companyId,
                category: body.category as DocumentCategories,
            });
        } catch (error) {
            console.error("Error confirming upload:", error);
            return ctx.json({ error: "An error occurred while confirming the upload." }, 500);
        }
    }

    async confirmUploadForSelfDisaster(ctx: Context): ControllerResponse<TypedResponse<UploadResult, 200>> {
        try {
            const body = await ctx.req.json<ConfirmUploadForSelfDisasterRequest>();
            const companyId = ctx.get("companyId");
            const userId = ctx.get("userId") || ctx.get("user")?.id;

            // Get claimId from selfDisasterId
            const claimId = await this.service.getClaimIdFromSelfDisaster(body.selfDisasterId);

            return this.handleConfirmUpload(ctx, {
                key: body.key,
                documentId: body.documentId,
                documentType: body.documentType,
                claimId,
                userId,
                companyId,
                category: body.category as DocumentCategories,
            });
        } catch (error) {
            console.error("Error confirming upload for self disaster:", error);
            return ctx.json({ error: "An error occurred while confirming the upload." }, 500);
        }
    }

    async confirmUploadForSelfDisastser(ctx: Context): ControllerResponse<TypedResponse<UploadResult, 200>> {
        const body = await ctx.req.json<ConfirmUploadForSelfDisasterRequest>();
        const { selfDisasterId } = body;
        const companyId = ctx.get("companyId");
        const userId = ctx.get("userId") || ctx.get("user")?.id;

        const claimId = await this.service.getClaimIdFromSelfDisaster(selfDisasterId);

        return this.handleConfirmUpload(ctx, {
            ...body,
            category: body.category || undefined,
            claimId: claimId,
            companyId: companyId,
            userId: userId,
        });
    }

    async deleteDocument(ctx: Context): ControllerResponse<TypedResponse<{ success: boolean }, 200>> {
        try {
            const body = await ctx.req.json<{ key: string; documentId: string }>();
            const { key, documentId } = body;

            if (!key || !documentId) {
                const errorResponse = {
                    error: "Missing required fields: key or documentId",
                };
                return ctx.json(errorResponse, 400);
            }

            // Delete from S3
            await this.service.deleteObject(key, documentId);

            return ctx.json({ success: true }, 200);
        } catch (error) {
            console.error("Error deleting document:", error);
            const errorResponse = {
                error: "An error occurred while deleting the document.",
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async getUploadUrl(ctx: Context): ControllerResponse<TypedResponse<GetUploadUrlResponse, 200>> {
        try {
            const body = await ctx.req.json<GetUploadUrlRequest>();
            const companyId = ctx.get("companyId");
            const { fileName, fileType, documentType, claimId } = body;

            // Make sure the required fields exist
            if (!companyId || !fileName || !fileType || !documentType) {
                const errorResponse = {
                    error: "Missing required fields: companyId, fileName, fileType, or documentType",
                };
                return ctx.json(errorResponse, 400);
            }
            if (!Object.values(DocumentTypes).includes(documentType)) {
                const errorResponse = {
                    error: `Invalid documentType. Must be one of: ${Object.values(DocumentTypes).join(", ")}`,
                };
                return ctx.json(errorResponse, 400);
            }

            // Get user ID from context, it will be used to upload to the images folder
            let userId: string | undefined;
            if (documentType === DocumentTypes.IMAGES) {
                userId = ctx.get("userId") || ctx.get("user")?.id;
                if (!userId) {
                    const errorResponse = {
                        error: "User authentication required",
                    };
                    return ctx.json(errorResponse, 400);
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
            const errorResponse = {
                error: "An error occurred while generating the upload URL.",
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async getAllDocuments(ctx: Context): ControllerResponse<TypedResponse<DocumentWithUrl[], 200>> {
        try {
            const companyId = ctx.req.query("companyId");
            const documentType = ctx.req.query("documentType") as DocumentTypes;
            const userId = ctx.req.query("userId");

            if (!companyId) {
                const errorResponse = {
                    error: "Missing required query parameter: companyId",
                };
                return ctx.json(errorResponse, 400);
            }

            if (!documentType) {
                const errorResponse = {
                    error: "Missing required query parameter: documentType",
                };
                return ctx.json(errorResponse, 400);
            }

            if (!Object.values(DocumentTypes).includes(documentType)) {
                const errorResponse = {
                    error: `Invalid documentType. Must be one of: ${Object.values(DocumentTypes).join(", ")}`,
                };
                return ctx.json(errorResponse, 400);
            }

            if (documentType === DocumentTypes.IMAGES && !userId) {
                const errorResponse = {
                    error: "User authentication required for image documents",
                };
                return ctx.json(errorResponse, 400);
            }

            const documents = await this.service.getAllDocuments(documentType, companyId, userId);

            if (!documents || documents.length === 0) {
                return ctx.json([], 200); // Return empty array instead of error
            }

            return ctx.json(documents, 200);
        } catch (error) {
            console.error("Error getting all documents:", error);
            const errorResponse = {
                error: "An error occurred while fetching documents.",
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async updateDocumentCategory(ctx: Context): ControllerResponse<TypedResponse<{ success: boolean }, 200>> {
        try {
            const body = await ctx.req.json<{ documentId: string; category: DocumentCategories }>();
            const { documentId, category } = body;

            if (!documentId) {
                // category is not required because it could be nothing
                const errorResponse = {
                    error: "Missing required fields: documentId",
                };
                return ctx.json(errorResponse, 400);
            }

            await this.service.updateDocumentCategory(documentId, category);

            return ctx.json({ success: true }, 200);
        } catch (error) {
            console.error("Error updating document category:", error);
            const errorResponse = {
                error: "An error occurred while updating the document category.",
            };
            return ctx.json(errorResponse, 500);
        }
    }
}
