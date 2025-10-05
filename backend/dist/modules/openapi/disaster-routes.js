import { createRoute } from "@hono/zod-openapi";
import { DisasterTransaction } from "../disaster/transaction";
import { DisasterService } from "../disaster/service";
import { DisasterController } from "../disaster/controller";
import { CreateDisasterDTOSchema, CreateDisasterResponseSchema, GetAllDisastersResponseSchema, } from "../../types/disaster";
import { openApiErrorCodes } from "../../utilities/error";
export const addOpenApiDisasterRoutes = (openApi, db) => {
    const disasterTransaction = new DisasterTransaction(db);
    const disasterService = new DisasterService(disasterTransaction);
    const disasterController = new DisasterController(disasterService);
    openApi.openapi(createDisasterRoute, (ctx) => disasterController.createDisaster(ctx));
    openApi.openapi(getAllDisastersRoute, (ctx) => disasterController.getAllDisasters(ctx));
    return openApi;
};
const createDisasterRoute = createRoute({
    method: "post",
    path: "/disaster",
    summary: "Create a new disaster",
    description: "Creates a new disaster with the provided information",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateDisasterDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateDisasterResponseSchema,
                },
            },
            description: "A disaster was created",
        },
        ...openApiErrorCodes("Creating Disaster Error"),
    },
    tags: ["Disaster"],
});
const getAllDisastersRoute = createRoute({
    method: "get",
    path: "/disaster",
    summary: "Get all disasters",
    description: "Gets all disasters stored in the database",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetAllDisastersResponseSchema,
                },
            },
            description: "Retrieved all disasters",
        },
        ...openApiErrorCodes("Getting Disaster Error"),
    },
    tags: ["Disaster"],
});
