import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { SelfDisasterTransaction } from "../self-disaster/transaction";
import { SelfDisasterService } from "../self-disaster/service";
import { SelfDisasterController } from "../self-disaster/controller";
import { CreateSelfDisasterDTOSchema, CreateSelfDisasterResponseSchema } from "../self-disaster/types";
import { openApiErrorCodes } from "../../utilities/error";

export const addOpenApiSelfDisasterRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const disasterTransaction = new SelfDisasterTransaction(db);
    const disasterService = new SelfDisasterService(disasterTransaction);
    const disasterController = new SelfDisasterController(disasterService);

    openApi.openapi(createSelfDisasterRoute, (ctx) => disasterController.createSelfDisaster(ctx));
    openApi.openapi(deleteSelfDisasterRoute, (ctx) => disasterController.deleteSelfDisaster(ctx));

    return openApi;
};

const createSelfDisasterRoute = createRoute({
    method: "post",
    path: "/self",
    summary: "Create a new self-reported disaster",
    description: "Creates a new self-reported disaster for a company with the provided information",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateSelfDisasterDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateSelfDisasterResponseSchema,
                },
            },
            description: "A self-reported disaster was created",
        },
        ...openApiErrorCodes("Creating Self Disaster Error"),
    },
    tags: ["Self Disaster"],
});

const deleteSelfDisasterRoute = createRoute({
    method: "delete",
    path: "/self/{id}",
    summary: "Delete a self-reported disaster",
    description: "Deletes a self-reported disaster by its ID",
    request: {
        params: z.object({
            id: z.string().openapi({
                param: {
                    name: "id",
                    in: "path",
                },
                description: "The ID of the self-reported disaster to delete",
                example: "123e4567-e89b-12d3-a456-426614174000",
            }),
        }),
    },
    responses: {
        200: {
            description: "Self-reported disaster was successfully deleted",
        },
        ...openApiErrorCodes("Deleting Self Disaster Error"),
    },
    tags: ["Self Disaster"],
});
