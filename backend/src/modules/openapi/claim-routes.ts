import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import {
    CreateClaimDTOSchema,
    CreateClaimResponseSchema,
    DeleteClaimDTOSchema,
    DeleteClaimResponseSchema,
    DeletePurchaseLineItemResponseSchema,
    GetClaimByIdResponseSchema,
    GetClaimsByCompanyIdResponseSchema,
    GetPurchaseLineItemsForClaimResponseSchema,
    LinkClaimToLineItemDTOSchema,
    LinkClaimToLineItemResponseSchema,
    LinkClaimToPurchaseDTOSchema,
    LinkClaimToPurchaseResponseSchema,
    UpdateClaimStatusDTOSchema,
    UpdateClaimStatusResponseSchema,
} from "../../types/Claim";
import { openApiErrorCodes } from "../../utilities/error";
import { ClaimController, IClaimController } from "../claim/controller";
import { ClaimService, IClaimService } from "../claim/service";
import { ClaimTransaction, IClaimTransaction } from "../claim/transaction";
import { ClaimPDFGenerationResponseSchema } from "../claim/types";
import { DocumentTransaction, IDocumentTransaction } from "../documents/transaction";
import { CompanyTransaction, ICompanyTransaction } from "../company/transaction";

export const createOpenAPIClaimRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const documentTransaction: IDocumentTransaction = new DocumentTransaction(db);
    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const claimService: IClaimService = new ClaimService(claimTransaction, documentTransaction, companyTransaction, db);
    const claimController: IClaimController = new ClaimController(claimService);

    openApi.openapi(createClaimRoute, (ctx) => claimController.createClaim(ctx));
    openApi.openapi(getClaimsByCompanyIdRoute, (ctx) => claimController.getClaimByCompanyId(ctx));
    openApi.openapi(getClaimByIdRoute, (ctx) => claimController.getClaimById(ctx));
    openApi.openapi(updateClaimStatusRoute, (ctx) => claimController.updateClaimStatus(ctx));
    openApi.openapi(deleteClaimRoute, (ctx) => claimController.deleteClaim(ctx));
    openApi.openapi(createLinkClaimPurchaseLineItemRoute, (ctx) => claimController.linkClaimToLineItem(ctx));
    openApi.openapi(createLinkClaimPurchaseRoute, (ctx) => claimController.linkClaimToPurchaseItems(ctx));
    openApi.openapi(getPurchaseLineItemsForClaimRoute, (ctx) => claimController.getLinkedPurchaseLineItems(ctx));
    openApi.openapi(deletePurchaseLineItemLinkRoute, (ctx) => claimController.deletePurchaseLineItem(ctx));
    openApi.openapi(generateClaimPDFRoute, (ctx) => claimController.createClaimPDF(ctx));
    return openApi;
};

const createClaimRoute = createRoute({
    method: "post",
    path: "/claims",
    summary: "Create a new claim",
    description: "Creates a new claim using a given company ID and disaster ID",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateClaimDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateClaimResponseSchema,
                },
            },
            description: "Claim created successfully",
        },
        ...openApiErrorCodes("Create Company Errors"),
    },
    tags: ["Claims"],
});

const getClaimsByCompanyIdRoute = createRoute({
    method: "get",
    path: "/claims/company",
    summary: "Gets all the claims associated with a company",
    description: "Gets all the claims for a company using a company ID",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetClaimsByCompanyIdResponseSchema,
                },
            },
            description: "Claims fetched successfully",
        },
        404: {
            description: "Claims not found",
        },
        ...openApiErrorCodes("Create Claims Errors"),
    },
    tags: ["Claims"],
});

const deleteClaimRoute = createRoute({
    method: "delete",
    path: "/claims/{id}",
    summary: "Deletes a claim from the database",
    description: "Deletes a claim based off a claim ID",
    request: {
        params: DeleteClaimDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: DeleteClaimResponseSchema,
                },
            },
            description: "Claim deleted successfully",
        },
        ...openApiErrorCodes("Create Claims Errors"),
    },
    tags: ["Claims"],
});

const createLinkClaimPurchaseLineItemRoute = createRoute({
    method: "post",
    path: "/claims/line-item",
    summary: "Creates a link between a claim and a purchase line item",
    description: "Creates a link between a claim with a given id and a purchase line item with a given id",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: LinkClaimToLineItemDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: LinkClaimToLineItemResponseSchema,
                },
            },
            description: "Link added successfully",
        },
        404: {
            description: "Claim or line item not found",
        },
        ...openApiErrorCodes("Link Creation Errors"),
    },
    tags: ["Claims"],
});

const createLinkClaimPurchaseRoute = createRoute({
    method: "post",
    path: "/claims/purchase",
    summary: "Creates a link between a claim and a purchase's line items",
    description: "Creates a link between a claim with a given id and a purchase's line items with a given id",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: LinkClaimToPurchaseDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: LinkClaimToPurchaseResponseSchema,
                },
            },
            description: "Links added successfully",
        },
        404: {
            description: "Claim or purchase line items not found",
        },
        ...openApiErrorCodes("Link Creation Errors"),
    },
    tags: ["Claims"],
});

const getPurchaseLineItemsForClaimRoute = createRoute({
    method: "get",
    path: "/claims/{id}/line-item",
    summary: "Gets all purchase line items linked to a claim",
    description: "Gets all purchase line items linked to a claim with a given id",
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetPurchaseLineItemsForClaimResponseSchema,
                },
            },
            description: "Line items retrieved successfully",
        },
        404: {
            description: "Claim not found",
        },
        ...openApiErrorCodes("Line item retrieval errors"),
    },
    tags: ["Claims"],
});

const deletePurchaseLineItemLinkRoute = createRoute({
    method: "delete",
    path: "/claims/{claimId}/line-item/{lineItemId}",
    summary: "Deletes the link between a claim and a purchase line item",
    description:
        "Deletes the link between a claim with a given claimId and a purchase line item" +
        "with a given purchaseLineItemId",
    request: {
        params: z.object({ claimId: z.uuid(), lineItemId: z.uuid() }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: DeletePurchaseLineItemResponseSchema,
                },
            },
            description: "Link deleted successfully",
        },
        404: {
            description: "Claim or line item not found",
        },
        ...openApiErrorCodes("Link deletion Errors"),
    },
    tags: ["Claims"],
});

const generateClaimPDFRoute = createRoute({
    method: "get",
    path: "/claims/{id}/pdf",
    summary: "Generates the pdf for the claim with the given ID",
    description: "Compiles the necessary information from the db and builds the appropriate PDF",
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: ClaimPDFGenerationResponseSchema,
                },
            },
            description: "Generated pdf available at the returned link",
        },
        404: {
            description: "Claim not found",
        },
        ...openApiErrorCodes("PDF generation error"),
    },
    tags: ["Claims"],
});

const getClaimByIdRoute = createRoute({
    method: "get",
    path: "/claims/{id}",
    summary: "Get a single claim by ID",
    description: "Retrieves a claim with all its relations (selfDisaster, femaDisaster, insurancePolicy, locations)",
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetClaimByIdResponseSchema,
                },
            },
            description: "Claim retrieved successfully",
        },
        404: {
            description: "Claim not found",
        },
        ...openApiErrorCodes("Get Claim Errors"),
    },
    tags: ["Claims"],
});

const updateClaimStatusRoute = createRoute({
    method: "patch",
    path: "/claims/{id}/status",
    summary: "Update a claim's status",
    description: "Updates a claim's status and optionally the insurance policy ID",
    request: {
        params: z.object({ id: z.uuid() }),
        body: {
            content: {
                "application/json": {
                    schema: UpdateClaimStatusDTOSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: UpdateClaimStatusResponseSchema,
                },
            },
            description: "Claim status updated successfully",
        },
        404: {
            description: "Claim not found",
        },
        ...openApiErrorCodes("Update Claim Status Errors"),
    },
    tags: ["Claims"],
});
