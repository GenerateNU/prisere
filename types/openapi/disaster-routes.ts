import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
    CreateDisasterDTOSchema,
    CreateDisasterResponseSchema,
    GetAllDisastersResponseSchema,
} from "../../types/disaster";
import { openApiErrorCodes } from "../Utils";

export const createDisasterRoute = createRoute({
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

export const getAllDisastersRoute = createRoute({
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
