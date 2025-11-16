import { Context, TypedResponse } from "hono";
import { ControllerResponse } from "../../utilities/response";
import { IS3Service } from "./service";
import { 
    ConfirmUploadRequest,
    DocumentTypes, 
    ErrorResponse, 
    GetUploadUrlRequest, 
    GetUploadUrlResponse, 
    PdfListItem, 
    UploadPdfOptionsSchema, 
    UploadResponse, 
    UploadResult 
} from "../../types/S3Types";


export interface IS3Controller {
    getUploadUrl(ctx: Context): Promise<TypedResponse<GetUploadUrlResponse | ErrorResponse>>;
    confirmUpload(ctx: Context): Promise<TypedResponse<UploadResult | ErrorResponse>>;
    getAllDocuments(ctx: Context): Promise<TypedResponse<PdfListItem[] | ErrorResponse>>;
}

export class S3Controller implements IS3Controller {
    constructor(private service: IS3Service) {}

    async getUploadUrl(ctx: Context): Promise<TypedResponse<GetUploadUrlResponse | ErrorResponse>> {
        try {
            const body = await ctx.req.json<GetUploadUrlRequest>();
            const { companyId, fileName, fileType, documentType, claimId } = body;

            console.log(`COMPANY ID: ${companyId}`);

            // Make sure the required fields exist
            if (!companyId || !fileName || !fileType || !documentType) {
                const errorResponse: ErrorResponse = { 
                    error: "Missing required fields: companyId, fileName, fileType, or documentType" 
                };
                return ctx.json(errorResponse, 400);
            }
            if (!Object.values(DocumentTypes).includes(documentType)) {
                const errorResponse: ErrorResponse = { 
                    error: `Invalid documentType. Must be one of: ${Object.values(DocumentTypes).join(", ")}` 
                };
                return ctx.json(errorResponse, 400);
            }

            // Get user ID from context, it will be used to upload to the images folder
            let userId: string | undefined;
            if (documentType === DocumentTypes.IMAGES) {
                userId = ctx.get("userId") || ctx.get("user")?.id;
                if (!userId) {
                    const errorResponse: ErrorResponse = { 
                        error: "User authentication required" 
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
                companyId
            });

            return ctx.json(response, 200);
        } catch (error) {
            console.error("Error generating upload URL:", error);
            const errorResponse: ErrorResponse = { 
                error: "An error occurred while generating the upload URL." 
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async confirmUpload(ctx: Context): Promise<TypedResponse<UploadResult | ErrorResponse>> {
        try {
            const body = await ctx.req.json<ConfirmUploadRequest>();
            const { key, documentId, documentType, claimId } = body;

            console.log(key, documentId, documentType);

            // Validate required fields
            if (!key || !documentId || !documentType) {
                const errorResponse: ErrorResponse = { 
                    error: "Missing required fields: key, documentId, or documentType" 
                };
                return ctx.json(errorResponse, 400);
            }

            // Get user ID from context
            const userId = ctx.get("userId") || ctx.get("user")?.id;
            if (!userId) {
                const errorResponse: ErrorResponse = { 
                    error: "User authentication required" 
                };
                return ctx.json(errorResponse, 401);
            }

            // Verify upload and get file info
            const response = await this.service.confirmUpload({
                key,
                documentId,
                documentType,
                claimId,
                userId,
            });

            return ctx.json(response, 200);
        } catch (error) {
            console.error("Error confirming upload:", error);
            const errorResponse: ErrorResponse = { 
                error: "An error occurred while confirming the upload." 
            };
            return ctx.json(errorResponse, 500);
        }
    }

    async getAllDocuments(ctx: Context): Promise<TypedResponse<PdfListItem[] | ErrorResponse>> {
        try {
            // Get parameters from query string instead of body
            const companyId = ctx.req.query("companyId");
            const documentType = ctx.req.query("documentType") as DocumentTypes;
            const userId = ctx.req.query("userId");

            console.log("Query params received:", { companyId, documentType, userId });

            // Validate required fields
            if (!companyId) {
                const errorResponse: ErrorResponse = { 
                    error: "Missing required query parameter: companyId" 
                };
                return ctx.json(errorResponse, 400);
            }

            if (!documentType) {
                const errorResponse: ErrorResponse = { 
                    error: "Missing required query parameter: documentType" 
                };
                return ctx.json(errorResponse, 400);
            }

            // Validate documentType
            if (!Object.values(DocumentTypes).includes(documentType)) {
                const errorResponse: ErrorResponse = { 
                    error: `Invalid documentType. Must be one of: ${Object.values(DocumentTypes).join(", ")}` 
                };
                return ctx.json(errorResponse, 400);
            }

            // Check if userId is required for IMAGES type
            if (documentType === DocumentTypes.IMAGES && !userId) {
                const errorResponse: ErrorResponse = { 
                    error: "User authentication required for image documents" 
                };
                return ctx.json(errorResponse, 401);
            }

            // Call service to get documents
            const response = await this.service.getAllDocuments(documentType, companyId, userId);

            if (!response) {
                const errorResponse: ErrorResponse = { 
                    error: "No documents found" 
                };
                return ctx.json(errorResponse, 404);
            }

            return ctx.json(response, 200);
        } catch (error) {
            console.error("Error getting all documents:", error);
            const errorResponse: ErrorResponse = { 
                error: "An error occurred while fetching documents." 
            };
            return ctx.json(errorResponse, 500);
        }
    }
}