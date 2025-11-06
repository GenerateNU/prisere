import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CompanyController, ICompanyController } from "../company/controller";
import { CompanyService, ICompanyService } from "../company/service";
import { CompanyTransaction, ICompanyTransaction } from "../company/transaction";
import { DataSource } from "typeorm";
import {
    CreateCompanyDTOSchema,
    CreateCompanyResponseSchema,
    GetCompanyByIdResponseSchema,
    UpdateQuickBooksImportTimeDTOSchema,
} from "../../types/Company";
import { openApiErrorCodes } from "../../utilities/error";
import { GetAllLocationAddressesSchema } from "../../types/Location";
import { ClaimTransaction, IClaimTransaction } from "../claim/transaction";
import { GetClaimInProgressForCompanySchema } from "../../types/Claim";

export const addOpenApiCompanyRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const companyService: ICompanyService = new CompanyService(companyTransaction, claimTransaction);
    const companyController: ICompanyController = new CompanyController(companyService);

    openApi.openapi(createCompanyRoute, (ctx) => companyController.createCompany(ctx));
    openApi.openapi(getCompanyByIdRoute, (ctx) => companyController.getCompanyById(ctx));
    openApi.openapi(updateCompanyInvoiceImportTimeRoute, (ctx) =>
        companyController.updateQuickbooksInvoiceImportTime(ctx)
    );
    openApi.openapi(updateCompanyPurchaseImportTimeRoute, (ctx) =>
        companyController.updateQuickbooksPurchaseImportTime(ctx)
    );
    openApi.openapi(getCompanyLocationsByIdRoute, (ctx) => companyController.getCompanyLocationsById(ctx));
    openApi.openapi(getCompanyClaimInProgress, (ctx) => companyController.getClaimInProgress(ctx));
    return openApi;
};

const createCompanyRoute = createRoute({
    method: "post",
    path: "/companies",
    summary: "Create a new company",
    description: "Creates a new company using a company name and optional Quickbooks import time",
    request: {
        body: {
            required: true,
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
    path: "/companies",
    summary: "Gets a company from the database",
    description: "Gets a company using the company ID",
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

const updateCompanyInvoiceImportTimeRoute = createRoute({
    method: "patch",
    path: "/companies/quickbooks-invoice-import-time",
    summary: "Update a company's lastQuickBooksInvoiceImportTime",
    description: "Updates the lastQuickBooksInvoiceImportTime for a company by ID",
    request: {
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

const updateCompanyPurchaseImportTimeRoute = createRoute({
    method: "patch",
    path: "/companies/quickbooks-purchase-import-time",
    summary: "Update a company's lastQuickBooksPurcahseImportTime",
    description: "Updates the lastQuickBooksPurcahseImportTime for a company by ID",
    request: {
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
    path: "/companies/location-address",
    summary: "Gets a company's location from the database",
    description: "Gets a company's locations using the company ID",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetAllLocationAddressesSchema,
                },
            },
            description: "Company locations fetched successfully",
        },
        ...openApiErrorCodes("Get Company Locations Errors"),
    },
    tags: ["Companies"],
});

const getCompanyClaimInProgress = createRoute({
    method: "get",
    path: "/companies/claim-in-progress",
    summary: "Get a company's claim in progress, if one exists",
    description: "Gets the company's current claim in progress. Companies can only have up to one claim in progress at a time.",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetClaimInProgressForCompanySchema
                }
            },
            description: "Claim fetched successfully"
        },
        ...openApiErrorCodes("Get Claim in Progress Errors"),
    },
    tags: ["Companies"],
});
