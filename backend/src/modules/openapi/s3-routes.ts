import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
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
    DeleteDocumentResponseSchema,
    DeleteDocumentRequestSchema,
    ConfirmUploadForSelfDisasterRequestSchema,
} from "../../types/S3Types";
import { DocumentTransaction } from "../documents/transaction";
import { DocumentCategories, DocumentWithUrlSchema } from "../../types/DocumentType";

export const addOpenApiS3Routes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const documentTransaction = new DocumentTransaction(db);
    const s3Service = new S3Service(db, documentTransaction);
    const s3Controller = new S3Controller(s3Service);

    openApi.openapi(getUploadUrlRoute, (ctx) => s3Controller.getUploadUrl(ctx));
    openApi.openapi(confirmUploadRoute, (ctx) => s3Controller.confirmUpload(ctx));
    openApi.openapi(getAllDocumentsRoute, (ctx) => s3Controller.getAllDocuments(ctx));
    openApi.openapi(deleteDocumentRoute, (ctx) => s3Controller.deleteDocument(ctx));
    openApi.openapi(updateDocumentCategoryRoute, (ctx) => s3Controller.updateDocumentCategory(ctx));
    openApi.openapi(confirmUploadForSelfDisasterRoute, (ctx) => s3Controller.confirmUploadForSelfDisaster(ctx));

    return openApi;
};

const getUploadUrlRoute = createRoute({
    method: "post",
    path: "/s3/getUploadUrl",
    summary: "Get presigned URL for document upload",
    description:
        "Generates a presigned URL that allows direct upload to S3 from the client. The URL expires after 1 hour.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: GetUploadUrlRequestSchema,
                },
            },
            required: true,
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
    description:
        "Verifies that a file was successfully uploaded to S3 and returns file details including a presigned download URL.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ConfirmUploadRequestSchema,
                },
            },
            required: true,
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

const confirmUploadForSelfDisasterRoute = createRoute({
    method: "post",
    path: "/s3/confirmUpload/selfDisaster",
    summary: "Confirm document upload completion for a document related to a self declared disaster",
    description:
        "Verifies that a file was successfully uploaded to S3 and returns file details including a presigned download URL and associates the document with the claim of the given self disaster.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: ConfirmUploadForSelfDisasterRequestSchema,
                },
            },
            required: true,
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

// In your OpenAPI routes file
const getAllDocumentsRoute = createRoute({
    method: "get",
    path: "/s3/getAllDocuments",
    summary: "Get all documents of a specific type",
    description: "Retrieves all documents of the specified type for a company or user.",
    request: {
        query: z.object({
            companyId: z.string().nonempty(),
            documentType: z.nativeEnum(DocumentTypes),
            userId: z.string().optional(),
        }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.array(DocumentWithUrlSchema),
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
            required: true,
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

const updateDocumentCategoryRoute = createRoute({
    method: "patch",
    path: "/s3/updateDocumentCategory",
    summary: "Update document category",
    description: "Updates the category of a document",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: z.object({
                        documentId: z.string().nonempty().describe("The database ID of the document"),
                        category: z.enum(DocumentCategories),
                    }),
                },
            },
            required: true,
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.boolean(),
                    }),
                },
            },
            description: "Category updated successfully",
        },
        400: {
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
            description: "Invalid request - missing documentId or category",
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
