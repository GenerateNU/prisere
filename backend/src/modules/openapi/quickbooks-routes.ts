import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { QuickbooksTransaction } from "../quickbooks/transaction";
import { QuickbooksClient } from "../../external/quickbooks/client";
import { QuickbooksService } from "../quickbooks/service";
import { QuickbooksController } from "../quickbooks/controller";
import { RedirectEndpointSuccessParams } from "../../types/quickbooks";
import z from "zod";
import { UserTransaction } from "../user/transaction";
import { InvoiceTransaction } from "../invoice/transaction";
import { InvoiceLineItemTransaction } from "../invoiceLineItem/transaction";
import { PurchaseTransaction } from "../purchase/transaction";
import { PurchaseLineItemTransaction } from "../purchase-line-item/transaction";

export const addOpenApiQBRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const transaction = new QuickbooksTransaction(db);
    const userTransaction = new UserTransaction(db);
    const invoiceTransaction = new InvoiceTransaction(db);
    const invoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
    const purchaseTransaction = new PurchaseTransaction(db);
    const purchaseLineItemTransaction = new PurchaseLineItemTransaction(db);
    const client = new QuickbooksClient({
        clientId: process.env.QUICKBOOKS_CLIENT_ID!,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
        environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    });

    const service = new QuickbooksService(
        transaction,
        userTransaction,
        invoiceTransaction,
        invoiceLineItemTransaction,
        purchaseTransaction,
        purchaseLineItemTransaction,
        client
    );
    const controller = new QuickbooksController(service);

    openApi.openapi(generateAuthRoute, (ctx) => controller.redirectToAuthorization(ctx));
    openApi.openapi(generateSessionRoute, (ctx) => controller.generateSession(ctx));
    openApi.openapi(importQuickbooksData, (ctx) => controller.importQuickbooksData(ctx));
    return openApi;
};

const generateAuthRoute = createRoute({
    method: "get",
    path: "/quickbooks",
    summary: "Generates an OAuth URL for the user and redirects them",
    tags: ["quickbooks"],
    responses: {
        200: {
            description: "Successfully redirected to quickbooks auth",
            content: {
                "application/json": {
                    schema: z.object({
                        url: z.string(),
                    }),
                },
            },
        },
    },
});

const generateSessionRoute = createRoute({
    method: "get",
    path: "/quickbooks/redirect",
    summary: "Syncs a QB OAuth session to our DB",
    description:
        "The path where the QuickBooks OAuth server redirects to upon a completed (successful or not) OAuth connection",
    tags: ["quickbooks"],
    request: {
        params: RedirectEndpointSuccessParams,
    },
    responses: {
        302: {
            description: "Successfully authenticated, redirecting",
        },
        400: {
            description: "Authentication failed",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
});

const importQuickbooksData = createRoute({
    method: "post",
    path: "/quickbooks/importQuickbooksData",
    summary:
        "Import quickbooks (invoice and purchase) data for a company, based off of the userId/user owner of the company",
    description:
        "mport quickbooks (invoice and purchase) data for a company, based off of the userId/user owner of the company",
    tags: ["quickbooks"],
    responses: {
        201: {
            description: "Successfully imported new QuickBooks data",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.literal(true),
                    }),
                },
            },
        },
        401: {
            description: "Could not authenticate to QuickBooks session",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
        404: {
            description: "QuickBooks data not found",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
        400: {
            description: "Bad request, invalid user ID or inputs",
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
});
