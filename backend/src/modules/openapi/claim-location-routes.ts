import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { IClaimLocationController, ClaimLocationController } from "../claim-location/controller";
import { IClaimLocationService, ClaimLocationService } from "../claim-location/service";
import { IClaimLocationTransaction, ClaimLocationTransaction } from "../claim-location/transaction";
import {
    CreateClaimLocationDTOSchema,
    CreateClaimLocationResponseSchema,
    DeleteClaimLocationDTOSchema,
    DeleteClaimLocationResponseSchema,
    GetLocationsByCompanyIdDTOSchema,
    GetLocationsByCompanyIdResponseSchema,
} from "../../types/ClaimLocation";
import { openApiErrorCodes } from "../../utilities/error";

export const addOpenApiClaimLocationRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const claimLocationTransaction: IClaimLocationTransaction = new ClaimLocationTransaction(db);
    const claimLocationService: IClaimLocationService = new ClaimLocationService(claimLocationTransaction);
    const claimLocationController: IClaimLocationController = new ClaimLocationController(claimLocationService);

    openApi.openapi(createClaimLocationRoute, (ctx) => claimLocationController.createClaimLocation(ctx));
    openApi.openapi(getClaimLocationsByCompanyIdRoute, (ctx) => claimLocationController.getLocationsByCompanyId(ctx));
    openApi.openapi(deleteClaimLocationRoute, (ctx) => claimLocationController.deleteClaimLocationById(ctx));
    return openApi;
};

export const createClaimLocationRoute = createRoute({
    method: "post",
    path: "/claim-locations",
    summary: "Create a new claim-location link",
    description: "Creates a link between a claim and a location using given IDs",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateClaimLocationDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateClaimLocationResponseSchema,
                },
            },
            description: "Claim-Location link created successfully",
        },
        ...openApiErrorCodes("Create Claim-Location  Errors"),
    },
    tags: ["Claim-Locations"],
});

export const getClaimLocationsByCompanyIdRoute = createRoute({
    method: "get",
    path: "/claim-locations/company/{companyId}",
    summary: "Gets all the locations affected by claims for a company",
    description: "Gets all the locations affected by claims for a company based on the given ID",
    request: {
        params: GetLocationsByCompanyIdDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetLocationsByCompanyIdResponseSchema,
                },
            },
            description: "Locations fetched successfully",
        },
        404: {
            description: "Locations/Company not found",
        },
        ...openApiErrorCodes("Get Claim-Location Errors"),
    },
    tags: ["Claim-Locations"],
});

export const deleteClaimLocationRoute = createRoute({
    method: "delete",
    path: "/claim-locations/claim/{claimId}/location-address/{locationId}",
    summary: "Deletes a claim-location link from the database",
    description: "Deletes a claim-location link based off the given claim ID and location ID",
    request: {
        params: DeleteClaimLocationDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: DeleteClaimLocationResponseSchema,
                },
            },
            description: "Claim-Location link deleted successfully",
        },
        ...openApiErrorCodes("Delete Claim-Location Errors"),
    },
    tags: ["Claim-Locations"],
});
