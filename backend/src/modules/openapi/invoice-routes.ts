import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { openApiErrorCodes } from "../../utilities/error";
import { InvoiceController } from "../invoice/controller";
import { InvoiceService } from "../invoice/service";
import { InvoiceTransaction } from "../invoice/transaction";
import {
    CreateOrUpdateInvoicesDTOSchema,
    CreateOrUpdateInvoiceResponseSchema,
    GetInvoiceDTOSchema,
    GetInvoiceResponseSchema,
    GetCompanyInvoicesDTOSchema,
    GetCompanyInvoicesResponseSchema,
} from "../../types/Invoice";
import { CompanyTransaction } from "../company/transaction";
import { z } from "zod";
import { IInvoiceLineItemController, InvoiceLineItemController } from "../invoiceLineItem/controller";
import { IInvoiceLineItemService, InvoiceLineItemService } from "../invoiceLineItem/service";
import { IInvoiceLineItemTransaction, InvoiceLineItemTransaction } from "../invoiceLineItem/transaction";
import {
    GetInvoiceLineItemsByInvoiceDTOSchema,
    GetInvoiceLineItemsByInvoiceResponseSchema,
} from "../../types/InvoiceLineItem";

export const addOpenApiInvoiceRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const invoiceTransaction = new InvoiceTransaction(db);
    const companyTransaction = new CompanyTransaction(db);
    const invoiceService = new InvoiceService(invoiceTransaction, companyTransaction);
    const invoiceController = new InvoiceController(invoiceService);

    const invoiceLineItemTransaction: IInvoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
    const invoiceLineItemService: IInvoiceLineItemService = new InvoiceLineItemService(
        invoiceLineItemTransaction,
        invoiceTransaction
    );
    const invoiceLineItemController: IInvoiceLineItemController = new InvoiceLineItemController(invoiceLineItemService);

    openApi.openapi(bulkCreateOrUpdateInvoiceRoute, (ctx) => invoiceController.bulkCreateOrUpdateInvoice(ctx));
    openApi.openapi(getInvoiceByIdRoute, (ctx) => invoiceController.getInvoice(ctx));
    openApi.openapi(getInvoicesForCompanyRoute, (ctx) => invoiceController.getInvoicesForCompany(ctx));
    openApi.openapi(getInvoiceLineItemsForInvoiceRoute, (ctx) =>
        invoiceLineItemController.getInvoiceLineItemsForInvoice(ctx)
    );
    return openApi;
};

const bulkCreateOrUpdateInvoiceRoute = createRoute({
    method: "post",
    path: "/invoice/bulk",
    summary: "Bulk create or update new invoices",
    description:
        "Creates new invoices according to the schema. If there is an invoice in the database with the same quickbooks_id, company_id pairing, then it will overwrite it's attributes",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateOrUpdateInvoicesDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateOrUpdateInvoiceResponseSchema,
                },
            },
            description: "Invoice(s) successfully created",
        },
        ...openApiErrorCodes("Creating/Updating Invoice Error"),
    },
    tags: ["Invoice"],
});

const getInvoiceByIdRoute = createRoute({
    method: "get",
    path: "/invoice/{id}",
    summary: "Get invoice by id",
    description: "Get invoice with matching ID from the database",
    request: {
        params: GetInvoiceDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetInvoiceResponseSchema,
                },
            },
            description: "Retrieved invoice",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
            description: "No Invoice with given UUID found",
        },
        ...openApiErrorCodes("Getting Invoice Error"),
    },
    tags: ["Invoice"],
});

const getInvoicesForCompanyRoute = createRoute({
    method: "get",
    path: "/invoice",
    summary: "Get invoices for a company",
    description: "Get invoices for a company with pagination params. Note page numbes are 0-indexed.",
    request: {
        query: GetCompanyInvoicesDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetCompanyInvoicesResponseSchema,
                },
            },
            description: "Retrieved invoice",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({ error: z.string() }),
                },
            },
            description: "No Invoice with given UUID found",
        },
        ...openApiErrorCodes("Getting Invoice Error"),
    },
    tags: ["Invoice"],
});

const getInvoiceLineItemsForInvoiceRoute = createRoute({
    method: "get",
    path: "/invoice/{id}/lines",
    summary: "Get all line items for a given invoice",
    description: "Get all line item for a given invoice",
    request: {
        params: GetInvoiceLineItemsByInvoiceDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetInvoiceLineItemsByInvoiceResponseSchema,
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
            description: "No Invoice Line Item with given UUID found",
        },
        ...openApiErrorCodes("Getting Invoice Line Item Error"),
    },
    tags: ["Invoice"],
});
