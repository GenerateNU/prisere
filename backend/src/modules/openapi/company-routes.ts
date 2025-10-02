import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CompanyController, ICompanyController } from "../company/controller";
import { CompanyService, ICompanyService } from "../company/service";
import { CompanyTransaction, ICompanyTransaction } from "../company/transaction";
import { DataSource } from "typeorm";
import {
    CreateCompanyDTOSchema,
    CreateCompanyResponseSchema,
    GetCompanyByIdDTOSchema,
    GetCompanyByIdResponseSchema,
    UpdateQuickBooksImportTimeDTOSchema,
} from "../../types/Company";
import { GetAllLocationAddressesAPIResponseSchema } from "../location-address/types";
import { openApiErrorCodes } from "../../utilities/error";

export const addOpenApiCompanyRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const companyService: ICompanyService = new CompanyService(companyTransaction);
    const companyController: ICompanyController = new CompanyController(companyService);

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
                    schema: CreateCompanyResponseSchema,
                },
            },
            description: "Company created successfully",
        },
        404: {
            description: "Company not found",
        },
        ...openApiErrorCodes("Create Company Errors"),
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
                    schema: GetCompanyByIdResponseSchema,
                },
            },
            description: "Company fetched successfully",
        },
        404: {
            description: "Company not found",
        },
        ...openApiErrorCodes("Create Company Errors"),
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
                    schema: UpdateQuickBooksImportTimeDTOSchema.omit({ companyId: true }),
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: CreateCompanyResponseSchema,
                },
            },
            description: "Company updated successfully",
        },
        ...openApiErrorCodes("Create Company Errors"),
    },
    tags: ["Companies"],
});

const getCompanyLocationsByIdRoute = createRoute({
    method: "get",
    path: "/companies/{id}/location-address",
    summary: "Gets a company's location from the database",
    description: "Gets a company's locations using the company ID",
    request: {
        params: GetCompanyByIdDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetAllLocationAddressesAPIResponseSchema,
                },
            },
            description: "Company locations fetched successfully",
        },
        400: {
            description: "Bad Request - Invalid input data",
        },
    },
    tags: ["Companies"],
});