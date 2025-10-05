import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { ClaimTransaction, IClaimTransaction } from "../claim/transaction";
import { ClaimService, IClaimService } from "../claim/service";
import { ClaimController, IClaimController } from "../claim/controller";
import { CreateClaimDTOSchema, CreateClaimResponseSchema, DeleteClaimDTOSchema, DeleteClaimResponseSchema, GetClaimsByCompanyIdDTOSchema, GetClaimsByCompanyIdResponseSchema } from "../../types/Claim";
import { openApiErrorCodes } from "../../utilities/error";

export const createOpenAPIClaimRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const claimTransaction: IClaimTransaction = new ClaimTransaction(db);
    const claimService: IClaimService = new ClaimService(claimTransaction);
    const claimController: IClaimController = new ClaimController(claimService);

    openApi.openapi(createClaimRoute, (ctx) => claimController.createClaim(ctx));
    //openApi.openapi(getClaimsByCompanyIdRoute, (ctx) => claimController.getClaimByCompanyId(ctx));
    openApi.openapi(deleteClaimRoute, (ctx) => claimController.deleteClaim(ctx));
    return openApi;
}

const createClaimRoute = createRoute({
    method: "post",
    path: "/claims",
    summary: "Create a new claim",
    description: "Creates a new claim using a given company ID and disaster ID",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateClaimDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateClaimResponseSchema,
                },
            },
            description: "Claim created successfully",
        },
        ...openApiErrorCodes("Create Company Errors"),
    },
    tags: ["Claims"],
});

/*
    const getClaimsByCompanyIdRoute = createRoute({
        method: "get",
        path: "/claims/company/{id}",
        summary: "Gets all the claims associated with a company",
        description: "Gets all the claims for a company using a company ID",
        request: {
            params: GetClaimsByCompanyIdDTOSchema,
        },
        responses: {
            200: {
                content: {
                    "application/json": {
                        schema: GetClaimsByCompanyIdResponseSchema,
                    },
                },
                description: "Claims fetched successfully",
            },
            404: {
                description: "Claims not found",
            },
            ...openApiErrorCodes("Create Claims Errors"),
        },
        tags: ["Claims"],
    });
*/
const deleteClaimRoute = createRoute({
    method: "delete",
    path: "/claims/{id}",
    summary: "Deletes a claim from the database",
    description: "Deletes a claim based off a claim ID",
    request: {
        params: DeleteClaimDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: DeleteClaimResponseSchema,
                },
            },
            description: "Claim deleted successfully",
        },
        ...openApiErrorCodes("Create Claims Errors"),
    },
    tags: ["Claims"],
});