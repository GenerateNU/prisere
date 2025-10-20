import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import { openApiErrorCodes } from "../../utilities/error";
import { IPurchaseLineItemTransaction, PurchaseLineItemTransaction } from "../purchase-line-item/transaction";
import { IPurchaseLineItemService, PurchaseLineItemService } from "../purchase-line-item/service";
import { IPurchaseLineItemController, PurchaseLineItemController } from "../purchase-line-item/controller";
import {
    CreateOrChangePurchaseLineItemsDTOSchema,
    CreateOrChangePurchaseLineItemsResponseSchema,
    GetPurchaseLineItemResponseSchema,
    GetPurchaseLineItemsFromParentResponseSchema,
} from "../purchase-line-item/types";

export const addOpenApiPurchaseLineItemRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const transaction: IPurchaseLineItemTransaction = new PurchaseLineItemTransaction(db);
    const service: IPurchaseLineItemService = new PurchaseLineItemService(transaction);
    const controller: IPurchaseLineItemController = new PurchaseLineItemController(service);

    openApi.openapi(createOrUpdatePurchaseLineItemsRoute, (ctx) => controller.createOrUpdatePurchaseLineItems(ctx));
    openApi.openapi(getPurchaseLineItemRoute, (ctx) => controller.getPurchaseLineItem(ctx));
    openApi.openapi(getPurchaseLineItemsForPurchaseRoute, (ctx) => controller.getPurchaseLineItemsForPurchase(ctx));

    return openApi;
};

const GetPurchaseLineItemDTOSchema = z.object({
    id: z.string().nonempty(),
});

const GetPurchaseLineItemsFromParentDTOSchema = z.object({
    id: z.string().nonempty(),
});

const createOrUpdatePurchaseLineItemsRoute = createRoute({
    method: "post",
    path: "/purchase/line/bulk",
    summary: "Create or update purchase line items",
    description:
        "Creates new purchase line items or updates existing ones. If an id is provided in the payload, the line item will be updated; otherwise, a new line item will be created. Multiple line items can be created or updated in a single request.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateOrChangePurchaseLineItemsDTOSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: CreateOrChangePurchaseLineItemsResponseSchema,
                },
            },
            description: "Successfully created or updated purchase line items",
        },
        404: {
            description: "Purchase with the given purchaseId does not exist",
        },
        ...openApiErrorCodes("Create or update purchase line items error"),
    },
    tags: ["Purchase Line Items"],
});

const getPurchaseLineItemRoute = createRoute({
    method: "get",
    path: "/purchase/line/{id}",
    summary: "Fetches a purchase line item by the given ID",
    description: "Finds the purchase line item with the given ID in the database",
    request: {
        params: GetPurchaseLineItemDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetPurchaseLineItemResponseSchema,
                },
            },
            description: "Successfully fetched purchase line item from the database",
        },
        404: {
            description: "There does not exist any purchase line item in the database with the given id",
        },
        ...openApiErrorCodes("Get purchase line item error"),
    },
    tags: ["Purchase Line Items"],
});

const getPurchaseLineItemsForPurchaseRoute = createRoute({
    method: "get",
    path: "/purchase/{id}/lines",
    summary: "Fetches all line items for a purchase by the given purchase ID",
    description:
        "Finds all purchase line items associated with the given purchase ID in the database. Returns an empty array if the purchase exists but has no line items.",
    request: {
        params: GetPurchaseLineItemsFromParentDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetPurchaseLineItemsFromParentResponseSchema,
                },
            },
            description: "Successfully fetched all purchase line items for the given purchase from the database",
        },
        404: {
            description: "There does not exist any purchase in the database with the given id",
        },
        ...openApiErrorCodes("Get purchase line items for purchase error"),
    },
    tags: ["Purchase Line Items"],
});
