import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { DisasterTransaction } from "../disaster/transaction";
import { DisasterService } from "../disaster/service";
import { DisasterController } from "../disaster/controller";
import {
    CreateDisasterAPIResponseSchema,
    CreateDisasterDTOSchema,
    GetAllDisastersResponseSchema,
} from "../../types/disaster";

export const addOpenApiDisasterRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
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
                    schema: CreateDisasterAPIResponseSchema,
                },
            },
            description: "Create disaster response",
        },
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
    },
    tags: ["Disaster"],
});
