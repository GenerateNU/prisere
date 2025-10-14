import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import {
    GetCompanyPurchasesDTOSchema,
<<<<<<< HEAD
    CreateOrChangePurchasesResponseSchema,
    GetPurchasesResponseSchema,
    GetCompanyPurchasesResponseSchema,
=======
    GetPurchasesResponseSchema,
    GetCompanyPurchasesResponseSchema,
    CreateOrChangePurchaseDTOSchema,
    CreateOrChangePurchasesResponseSchema,
    GetPurchaseDTOSchema,
    GetCompanyPurchasesSummationResponseSchema,
>>>>>>> main
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
<<<<<<< HEAD
=======
    openApi.openapi(sumPurchasesByCompanyAndDateRange, (ctx) => controller.sumPurchasesByCompanyAndDateRange(ctx));
>>>>>>> main

    return openApi;
};

const GetPurchaseDTOSchemaLocal = z.object({
    id: z.string().nonempty(),
});

const createOrUpdatePurchaseRoute = createRoute({
    method: "post",
<<<<<<< HEAD
    path: "/purchase",
=======
    path: "/purchase/bulk",
>>>>>>> main
    summary: "Create or update a purchase",
    description: "Creates a new purchase or updates an existing purchase with the provided information",
    request: {
        body: {
            content: {
                "application/json": {
<<<<<<< HEAD
                    schema: CreateOrChangePurchasesResponseSchema,
=======
                    schema: CreateOrChangePurchaseDTOSchema,
>>>>>>> main
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateOrChangePurchasesResponseSchema,
                },
            },
            description: "Purchase created successfully",
        },
        200: {
            content: {
                "application/json": {
                    schema: CreateOrChangePurchasesResponseSchema,
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
    path: "/purchase",
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
<<<<<<< HEAD
=======

const sumPurchasesByCompanyAndDateRange = createRoute({
    method: "get",
    path: "/purchase/bulk/{id}/totalExpenses",
    summary: "Get the summation of purchases for a company in a date range",
    description:
        "Get the summation of purchases for a company that were made after the start date and before the end date",
    request: {
        params: GetPurchaseDTOSchema,
        query: z.object({ startDate: z.iso.datetime(), endDate: z.iso.datetime() }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetCompanyPurchasesSummationResponseSchema,
                },
            },
            description: "Found summation successfully",
        },
        ...openApiErrorCodes("Getting Purchase Error"),
    },
    tags: ["Purchases"],
});
>>>>>>> main
