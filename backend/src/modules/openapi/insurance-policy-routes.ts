import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { openApiErrorCodes } from "../../utilities/error";
import { IInsurancePolicyController, InsurancePolicyController } from "../insurance-policy/controller";
import { IInsurancePolicyTransaction, InsurancePolicyTransaction } from "../insurance-policy/transaction";
import { IInsurancePolicyService, InsurancePolicyService } from "../insurance-policy/service";
import {
    CreateInsurancePolicyBulkDTOSchema,
    CreateInsurancePolicyBulkResponseSchema,
    CreateInsurancePolicyDTOSchema,
    CreateInsurancePolicyResponseSchema,
    GetInsurancePoliciesResponseSchema,
    UpdateInsurancePolicyBulkDTOSchema,
    UpdateInsurancePolicyBulkResponseSchema,
    UpdateInsurancePolicyDTOSchema,
    UpdateInsurancePolicyResponseSchema,
} from "../insurance-policy/types";

export const addOpenApiInsurancePolicyRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const transaction: IInsurancePolicyTransaction = new InsurancePolicyTransaction(db);
    const service: IInsurancePolicyService = new InsurancePolicyService(transaction);
    const controller: IInsurancePolicyController = new InsurancePolicyController(service);

    openApi.openapi(createInsurancePolicyRoute, (ctx) => controller.createInsurancePolicy(ctx));
    openApi.openapi(createInsurancePolicyBulkRoute, (ctx) => controller.createInsureancePolicyBulk(ctx));
    openApi.openapi(getInsurancePolicyRoute, (ctx) => controller.getAllPolicies(ctx));
    openApi.openapi(updateInsurancePolicy, (ctx) => controller.updateInsurancePolicy(ctx));
    openApi.openapi(updateInsurancePolicyBulk, (ctx) => controller.updateInsurancePolicyBulk(ctx));

    return openApi;
};

const createInsurancePolicyRoute = createRoute({
    method: "post",
    path: "/insurance",
    summary: "Create data about the company's insurance policy",
    description: "Creates a new entity with data about the company's insurance policy",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: CreateInsurancePolicyDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateInsurancePolicyResponseSchema,
                },
            },
            description: "Create insurance policy response",
        },
        ...openApiErrorCodes("Error Creating an insurance policy"),
    },
    tags: ["Insurance Policy"],
});

const getInsurancePolicyRoute = createRoute({
    method: "get",
    path: "/insurance",
    summary: "Gets all of the insurance policies for a company",
    description: "Will get all of the insurance policies that have been created for a Company",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetInsurancePoliciesResponseSchema,
                },
            },
            description: "Result includes all of the insurance policies for the user's company",
        },
        ...openApiErrorCodes("Error Getting insurance policies for the company"),
    },
    tags: ["Insurance Policy"],
});

const createInsurancePolicyBulkRoute = createRoute({
    method: "post",
    path: "/insurance/bulk",
    summary: "Creates data about the company's insurance policy",
    description: "Can create many new entities with data about the company's insurance policy",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: CreateInsurancePolicyBulkDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateInsurancePolicyBulkResponseSchema,
                },
            },
            description: "Create bulk insurance policy response",
        },
        ...openApiErrorCodes("Error Creating insurance policies in bulk"),
    },
    tags: ["Insurance Policy"],
});

const updateInsurancePolicy = createRoute({
    method: "patch",
    path: "/insurance",
    summary: "Update the given insurance policy",
    description: "Updates the insurancy policy information for the insurance with the given id",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UpdateInsurancePolicyDTOSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: UpdateInsurancePolicyResponseSchema,
                },
            },
            description: "Insurance updated successfully",
        },
        ...openApiErrorCodes("Update Insurance Errors"),
    },
});

const updateInsurancePolicyBulk = createRoute({
    method: "patch",
    path: "/insurance/bulk",
    summary: "Update the given array of insurance policies",
    description: "Updates the insurance information for each of the given insurance policies based on their id",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UpdateInsurancePolicyBulkDTOSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: UpdateInsurancePolicyBulkResponseSchema,
                },
            },
            description: "Insurance updated successfully",
        },
        ...openApiErrorCodes("Update Insurance in Bulk Errors"),
    },
});
