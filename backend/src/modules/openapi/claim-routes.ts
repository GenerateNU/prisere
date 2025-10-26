import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { ClaimTransaction, IClaimTransaction } from "../claim/transaction";
import { ClaimService, IClaimService } from "../claim/service";
import { ClaimController, IClaimController } from "../claim/controller";
import {
    CreateClaimDTOSchema,
    CreateClaimResponseSchema,
    DeleteClaimDTOSchema,
    DeleteClaimResponseSchema,
    DeletePurchaseLineItemResponseSchema,
    GetClaimsByCompanyIdResponseSchema,
    GetPurchaseLineItemsForClaimResponseSchema, LinkClaimToLineItemDTOSchema,
    LinkClaimToLineItemResponseSchema,
    LinkClaimToPurchaseDTOSchema,
    LinkClaimToPurchaseResponseSchema,
} from "../../types/Claim";
import { openApiErrorCodes } from "../../utilities/error";

export const createOpenAPIClaimRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const claimService: IClaimService = new ClaimService(claimTransaction);
    const claimController: IClaimController = new ClaimController(claimService);

    openApi.openapi(createClaimRoute, (ctx) => claimController.createClaim(ctx));
    openApi.openapi(getClaimsByCompanyIdRoute, (ctx) => claimController.getClaimByCompanyId(ctx));
    openApi.openapi(deleteClaimRoute, (ctx) => claimController.deleteClaim(ctx));
    openApi.openapi(createLinkClaimPurchaseLineItemRoute, (ctx) => claimController.linkClaimToLineItem(ctx));
    openApi.openapi(createLinkClaimPurchaseRoute, (ctx) => claimController.linkClaimToPurchaseItems(ctx));
    openApi.openapi(getPurchaseLineItemsForClaimRoute, (ctx) => claimController.getLinkedPurchaseLineItems(ctx));
    openApi.openapi(deletePurchaseLineItemLinkRoute, (ctx) => claimController.deletePurchaseLineItem(ctx));
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
        params: z.object({ id: z.uuid()}),
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
    description: "Deletes the link between a claim with a given claimId and a purchase line item" +
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
