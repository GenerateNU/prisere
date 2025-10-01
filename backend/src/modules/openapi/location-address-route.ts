import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
    CreateLocationAddressResponseSchema,
    CreateLocationAddressSchema,
    GetLocationAddressResponseSchema,
    GetLocationAddressSchema,
} from "../../types/Location";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { ILocationAddressService, LocationAddressService } from "../location-address/service";
import { ILocationAddressController, LocationAddressController } from "../location-address/controller";
import { openApiErrorCodes } from "../../utilities/error";

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
                    schema: CreateLocationAddressResponseSchema,
                },
            },
            description: "Create location address response",
        },
        ...openApiErrorCodes("Error Creating Location Address"),
    },
    tags: ["Location Address"],
});

const getLocationAddressRoute = createRoute({
    method: "get",
    path: "/location-address",
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
            description: "Finds the associated location address for the given information",
        },
        ...openApiErrorCodes("Error Getting Location Address"),
    },
    tags: ["Location Address"],
});
