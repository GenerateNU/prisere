import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import { DataSource } from "typeorm";
import { S3Controller } from "../s3/controller";
import { S3Service } from "../s3/service";
import { 
    ErrorResponseSchema, 
    UploadResultSchema,
    DocumentTypes, 
    ConfirmUploadRequestSchema,
    GetUploadUrlRequestSchema,
    GetUploadUrlResponseSchema,
    PdfListItemSchema,
    DeleteDocumentResponseSchema,
    DeleteDocumentRequestSchema
} from "../../types/S3Types";
import { DocumentTransaction } from "../documents/transaction";

export const addOpenApiS3Routes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const documentTransaction = new DocumentTransaction(db);
    const s3Service = new S3Service(db, documentTransaction);
    const s3Controller = new S3Controller(s3Service);

    openApi.openapi(getUploadUrlRoute, (ctx) => s3Controller.getUploadUrl(ctx) as any);
    openApi.openapi(confirmUploadRoute, (ctx) => s3Controller.confirmUpload(ctx) as any);
    openApi.openapi(getAllDocumentsRoute, (ctx) => s3Controller.getAllDocuments(ctx) as any);
    openApi.openapi(deleteDocumentRoute, (ctx) => s3Controller.deleteDocument(ctx) as any);

    return openApi;
};

const getUploadUrlRoute = createRoute({
    method: "post",
    path: "/s3/getUploadUrl",
    summary: "Get presigned URL for document upload",
    description: "Generates a presigned URL that allows direct upload to S3 from the client. The URL expires after 1 hour.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: GetUploadUrlRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetUploadUrlResponseSchema,
                },
            },
            description: "Presigned URL generated successfully",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Invalid request - missing or invalid parameters",
        },
        401: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "User authentication required",
        },
        500: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Internal server error",
        },
    },
    tags: ["S3"],
});

const confirmUploadRoute = createRoute({
    method: "post",
    path: "/s3/confirmUpload",
    summary: "Confirm document upload completion",
    description: "Verifies that a file was successfully uploaded to S3 and returns file details including a presigned download URL.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ConfirmUploadRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: UploadResultSchema,
                },
            },
            description: "Upload confirmed successfully",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Invalid request - missing or invalid parameters",
        },
        401: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "User authentication required",
        },
        404: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "File not found in S3",
        },
        500: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Internal server error",
        },
    },
    tags: ["S3"],
});

const getAllDocumentsRoute = createRoute({
    method: "get",
    path: "/s3/getAllDocuments",
    summary: "Get all documents of a specific type",
    description: "Retrieves all documents of the specified type for a company or user.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        companyId: z.string().nonempty(),
                        documentType: z.nativeEnum(DocumentTypes),
                        userId: z.string().optional(),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.array(PdfListItemSchema),
                },
            },
            description: "Documents retrieved successfully",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Invalid request - missing or invalid parameters",
        },
        401: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "User authentication required",
        },
        404: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "No documents found",
        },
        500: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Internal server error",
        },
    },
    tags: ["S3"],
});

const deleteDocumentRoute = createRoute({
    method: "delete",
    path: "/s3/deleteDocument",
    summary: "Delete a document",
    description: "Deletes a document from both S3 storage and the database. This action cannot be undone.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: DeleteDocumentRequestSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: DeleteDocumentResponseSchema,
                },
            },
            description: "Document deleted successfully from both S3 and database",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Invalid request - missing key or documentId",
        },
        500: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Internal server error - failed to delete document",
        },
    },
    tags: ["S3"],
});