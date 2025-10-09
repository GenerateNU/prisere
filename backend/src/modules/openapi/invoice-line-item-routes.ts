import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { openApiErrorCodes } from "../../utilities/error";
import { IInvoiceTransaction, InvoiceTransaction } from "../invoice/transaction";
import { z } from "zod";
import { IInvoiceLineItemTransaction, InvoiceLineItemTransaction } from "../invoiceLineItem/transaction";
import { IInvoiceLineItemController, InvoiceLineItemController } from "../invoiceLineItem/controller";
import { IInvoiceLineItemService, InvoiceLineItemService } from "../invoiceLineItem/service";
import {
    CreateOrUpdateInvoiceLineItemsDTOSchema,
    CreateOrUpdateInvoiceLineItemsResponseSchema,
    GetInvoiceLineItemDTOSchema,
    GetInvoiceLineItemResponseSchema,
} from "../../types/InvoiceLineItem";

export const addOpenApiInvoiceLineItemRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const invoiceTransaction: IInvoiceTransaction = new InvoiceTransaction(db);
    const invoiceLineItemTransaction: IInvoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
    const invoiceLineItemService: IInvoiceLineItemService = new InvoiceLineItemService(
        invoiceLineItemTransaction,
        invoiceTransaction
    );
    const invoiceLineItemController: IInvoiceLineItemController = new InvoiceLineItemController(invoiceLineItemService);

    openApi.openapi(bulkCreateOrUpdateInvoiceLineItemRoute, (ctx) =>
        invoiceLineItemController.bulkCreateOrUpdateInvoiceLineItems(ctx)
    );
    openApi.openapi(getInvoiceLineItemByIdRoute, (ctx) => invoiceLineItemController.getInvoiceLineItemById(ctx));
    return openApi;
};

const bulkCreateOrUpdateInvoiceLineItemRoute = createRoute({
    method: "post",
    path: "/invoice/line/bulk",
    summary: "Bulk create or update new invoice line items",
    description:
        "Creates new invoice line items according to the schema. If there is an invoice line item in the database with the same quickbooks_id, invoice_id pairing, then it will overwrite it's attributes",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateOrUpdateInvoiceLineItemsDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateOrUpdateInvoiceLineItemsResponseSchema,
                },
            },
            description: "Invoice line items(s) successfully created",
        },
        ...openApiErrorCodes("Creating/Updating Invoice Line Item Error"),
    },
    tags: ["InvoiceLineItem"],
});

const getInvoiceLineItemByIdRoute = createRoute({
    method: "get",
    path: "/invoice/line/{id}",
    summary: "Get invoice line item by id",
    description: "Get invoice line item with matching ID from the database",
    request: {
        params: GetInvoiceLineItemDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetInvoiceLineItemResponseSchema,
                },
            },
            description: "Retrieved invoice line item",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
            description: "No Invoice line item with given UUID found",
        },
        ...openApiErrorCodes("Getting Invoice Line Item Error"),
    },
    tags: ["InvoiceLineItem"],
});
