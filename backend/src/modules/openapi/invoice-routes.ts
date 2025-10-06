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
    GetCompanyInvoicesByDateDTOSchema,
} from "../../types/Invoice";
import { CompanyTransaction } from "../company/transaction";
import { z } from "zod";

export const addOpenApiInvoiceRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const invoiceTransaction = new InvoiceTransaction(db);
    const companyTransaction = new CompanyTransaction(db);
    const invoiceService = new InvoiceService(invoiceTransaction, companyTransaction);
    const invoiceController = new InvoiceController(invoiceService);

    openApi.openapi(bulkCreateOrUpdateInvoiceRoute, (ctx) => invoiceController.bulkCreateOrUpdateInvoice(ctx));
    openApi.openapi(getInvoiceByIdRoute, (ctx) => invoiceController.getInvoice(ctx));
    openApi.openapi(getInvoicesForCompanyRoute, (ctx) => invoiceController.getInvoicesForCompany(ctx));
    openApi.openapi(getInvoicesForCompanyByDate, (ctx) => invoiceController.getInvoicesForCompanyByDate(ctx));
    return openApi;
};

const bulkCreateOrUpdateInvoiceRoute = createRoute({
    method: "post",
    path: "/quickbooks/invoice/bulk",
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
    path: "/quickbooks/invoice/{id}",
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
    path: "/quickbooks/invoice",
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

const getInvoicesForCompanyByDate = createRoute({
    method: "get",
    path: "/quickbooks/invoice/bulk/{id}",
    summary: "Get invoices for a company by date",
    description: "Get invoices for a company that were made after the start date and before the end date",
    request: {
        params: GetInvoiceDTOSchema,
        query: z.object({startDate: z.iso.datetime(), endDate: z.iso.datetime()}),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetCompanyInvoicesResponseSchema,
                },
            },
            description: "Retrieved invoices",
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
