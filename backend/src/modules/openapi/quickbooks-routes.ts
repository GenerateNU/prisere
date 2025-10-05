import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { QuickbooksTransaction } from "../quickbooks/transaction";
import { QuickbooksClient } from "../../external/quickbooks/client";
import { QuickbooksService } from "../quickbooks/service";
import { QuickbooksController } from "../quickbooks/controller";
import { RedirectEndpointSuccessParams } from "../../types/Quickbooks";
import z from "zod";

export const addOpenApiQBRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const transaction = new QuickbooksTransaction(db);
    const client = new QuickbooksClient({
        clientId: process.env.QUICKBOOKS_CLIENT_ID!,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
        environment: "sandbox",
    });

    const service = new QuickbooksService(transaction, client);
    const controller = new QuickbooksController(service);

    openApi.openapi(generateAuthRoute, (ctx) => controller.redirectToAuthorization(ctx));
    openApi.openapi(generateSessionRoute, (ctx) => controller.generateSession(ctx));
    return openApi;
};

const generateAuthRoute = createRoute({
    method: "get",
    path: "/quickbooks",
    summary: "Generates an OAuth URL for the user and redirects them",
    tags: ["quickbooks"],
    responses: {
        302: {
            description: "Redirected to QuickBooks OAuth url",
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
        200: {
            description: "Successfully logged in through QB",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.literal(true),
                    }),
                },
            },
        },
        400: {
            description: "Did not grant permissions",
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
