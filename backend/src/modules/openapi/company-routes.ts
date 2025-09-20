import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CompanyController } from "../company/controller";
import { CompanyService, ICompanyService } from "../company/service";
import { CompanyTransaction, ICompanyTransaction } from "../company/transaction";
import { DataSource } from "typeorm";
import {
    CreateCompanyAPIResponseSchema,
    CreateCompanyDTOSchema,
    GetCompanyByIdAPIResponseSchema,
    GetCompanyByIdDTOSchema,
    UpdateQuickBooksImportTimeDTOSchema,
} from "../../types/Company";

export const addOpenApiCompanyRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const companyService: ICompanyService = new CompanyService(companyTransaction);
    const companyController: CompanyController = new CompanyController(companyService);

    openApi.openapi(createCompanyRoute, (ctx) => companyController.createCompany(ctx));
    openApi.openapi(getCompanyByIdRoute, (ctx) => companyController.getCompanyById(ctx));
    openApi.openapi(updateCompanyImportTimeRoute, (ctx) => companyController.updateQuickbooksImportTime(ctx));
    return openApi;
};

const createCompanyRoute = createRoute({
    method: "post",
    path: "/companies",
    summary: "Create a new company",
    description: "Creates a new company using a company name and optional Quickbooks import time",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateCompanyDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateCompanyAPIResponseSchema,
                },
            },
            description: "Company created successfully",
        },
        400: {
            description: "Bad Request - Invalid input data",
        },
    },
    tags: ["Companies"],
});

const getCompanyByIdRoute = createRoute({
    method: "get",
    path: "/companies/{id}",
    summary: "Gets a company from the database",
    description: "Gets a company using the company ID",
    request: {
        params: GetCompanyByIdDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetCompanyByIdAPIResponseSchema,
                },
            },
            description: "Company fetched successfully",
        },
        400: {
            description: "Bad Request - Invalid input data",
        },
        404: {
            description: "Company not found",
        },
    },
    tags: ["Companies"],
});

const updateCompanyImportTimeRoute = createRoute({
    method: "patch",
    path: "/companies/{id}/import-time",
    summary: "Update a company's lastQuickBooksImportTime",
    description: "Updates the lastQuickBooksImportTime for a company by ID",
    request: {
        params: GetCompanyByIdDTOSchema,
        body: {
            content: {
                "application/json": {
                    schema: UpdateQuickBooksImportTimeDTOSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: CreateCompanyAPIResponseSchema,
                },
            },
            description: "Company updated successfully",
        },
        400: {
            description: "Bad Request - Invalid input data",
        },
        404: {
            description: "Company not found",
        },
    },
    tags: ["Companies"],
});
