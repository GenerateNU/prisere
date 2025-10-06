import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import {
    CreateOrPatchPurchaseDTO,
    createOrPatchPurchasesResponseSchema,
    GetPurchasesResponseSchema,
    GetCompanyPurchasesDTOSchema,
    GetCompanyPurchasesResponseSchema,
} from "../../modules/purchase/types";
import { IPurchaseController, PurchaseController } from "../purchase/controller";
import { IPurchaseService, PurchaseService } from "../purchase/service";
import { IPurchaseTransaction, PurchaseTransaction } from "../purchase/transaction";
import { openApiErrorCodes } from "../../utilities/error";

export const addOpenApiPurchaseRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const transaction: IPurchaseTransaction = new PurchaseTransaction(db);
    const service: IPurchaseService = new PurchaseService(transaction);
    const controller: IPurchaseController = new PurchaseController(service);

    openApi.openapi(createOrUpdatePurchaseRoute, (ctx) => controller.createOrUpdatePurchase(ctx));
    openApi.openapi(getPurchaseRoute, (ctx) => controller.getPurchase(ctx));
    openApi.openapi(getPurchasesForCompanyRoute, (ctx) => controller.getPurchasesForCompany(ctx));

    return openApi;
};

const GetPurchaseDTOSchemaLocal = z.object({
    id: z.string().nonempty(),
});

const createOrUpdatePurchaseRoute = createRoute({
    method: "post",
    path: "/purchase",
    summary: "Create or update a purchase",
    description: "Creates a new purchase or updates an existing purchase with the provided information",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateOrPatchPurchaseDTO,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: createOrPatchPurchasesResponseSchema,
                },
            },
            description: "Purchase created successfully",
        },
        200: {
            content: {
                "application/json": {
                    schema: createOrPatchPurchasesResponseSchema,
                },
            },
            description: "Purchase updated successfully",
        },
        404: {
            description: "Purchase not found when attempting to update",
        },
        ...openApiErrorCodes("Create or update purchase error"),
    },
    tags: ["Purchases"],
});

const getPurchaseRoute = createRoute({
    method: "get",
    path: "/purchase/{id}",
    summary: "Fetches a purchase by the given ID",
    description: "Finds the purchase with the given ID in the database",
    request: {
        params: GetPurchaseDTOSchemaLocal,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetPurchasesResponseSchema,
                },
            },
            description: "Successful fetch of a purchase from the database",
        },
        404: {
            description: "There does not exist any purchase in the database such that the given id matches their id",
        },
        ...openApiErrorCodes("Get purchase error"),
    },
    tags: ["Purchases"],
});

const getPurchasesForCompanyRoute = createRoute({
    method: "get",
    path: "/purchases/",
    summary: "Fetches all purchases for a company",
    description: "Retrieves a paginated list of purchases for the specified company",
    request: {
        query: GetCompanyPurchasesDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetCompanyPurchasesResponseSchema,
                },
            },
            description: "Successful fetch of company purchases from the database",
        },
        ...openApiErrorCodes("Get company purchases error"),
    },
    tags: ["Purchases"],
});
