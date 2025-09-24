import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
    CreateLocationAddressAPIResponseSchema,
    CreateLocationAddressSchema,
    GetLocationAddressAPIResponseSchema,
    GetLocationAddressSchema,
} from "../location-address/types";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { ILocationAddressService, LocationAddressService } from "../location-address/service";
import { ILocationAddressController, LocationAddressController } from "../location-address/controller";

export const addOpenApiLocationAddressRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const locationAddressTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const locationAddressService: ILocationAddressService = new LocationAddressService(locationAddressTransaction);
    const locationAddressController: ILocationAddressController = new LocationAddressController(locationAddressService);

    openApi.openapi(createLocationAddressRoute, (ctx) => locationAddressController.createLocationAddress(ctx));
    openApi.openapi(getLocationAddressRoute, (ctx) => locationAddressController.getLocationAddress(ctx));

    return openApi;
};

const createLocationAddressRoute = createRoute({
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
                    schema: CreateLocationAddressAPIResponseSchema,
                },
            },
            description: "Create location address response",
        },
        500: {
            content: {
                "application/json": {
                    schema: CreateLocationAddressAPIResponseSchema,
                },
            },
            description: "Unable to create the location address with the given payload",
        },
    },
    tags: ["Location Address"],
});

const getLocationAddressRoute = createRoute({
    method: "get",
    path: "/location-address",
    summary: "Gets an address for some location of a company",
    description: "Creates a new location address with the provided information",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: GetLocationAddressSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetLocationAddressAPIResponseSchema,
                },
            },
            description: "Finds the associated location address for the given information",
        },
        400: {
            description: "The given ID was omitted or is not a well formed UUID",
        },
        404: {
            description: "The given UUID does not have an associated location address in the database",
        },
        500: {
            description: "There was an internal issue with finding the location address with the provided id",
        },
    },
    tags: ["Location Address"],
});
