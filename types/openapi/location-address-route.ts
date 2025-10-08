import { createRoute} from "@hono/zod-openapi";
import {
    CreateLocationAddressResponseSchema,
    CreateLocationAddressSchema,
    GetLocationAddressResponseSchema,
    GetLocationAddressSchema,
} from "../../types/Location";
import { openApiErrorCodes } from "../Utils";

export const createLocationAddressRoute = createRoute({
    method: "post",
    path: "/location-address",
    summary: "Create an address for some location of a company",
    description: "Creates a new location address with the provided information",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateLocationAddressSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateLocationAddressResponseSchema,
                },
            },
            description: "Create location address response",
        },
        ...openApiErrorCodes("Error Creating Location Address"),
    },
    tags: ["Location Address"],
});

export const getLocationAddressRoute = createRoute({
    method: "get",
    path: "/location-address/{id}",
    summary: "Gets an address for some location of a company",
    description: "Creates a new location address with the provided information",
    request: {
        params: GetLocationAddressSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetLocationAddressResponseSchema,
                },
            },
            description: "The associated location address for the given information",
        },
        404: {
            description: "The given UUID does not have an associated location address in the database",
        },
        ...openApiErrorCodes("Error Getting Location Address"),
    },
    tags: ["Location Address"],
});

export const removeLocationAddressRoute = createRoute({
    method: "delete",
    path: "/location-address/{id}",
    summary: "Removes location of a company",
    description: "Removes the location address with the provided id",
    request: {
        params: GetLocationAddressSchema,
    },
    responses: {
        204: {
            description: "Location successfully deleted",
        },
        ...openApiErrorCodes("Error removing location address"),
    },
    tags: ["Location Address"],
});
