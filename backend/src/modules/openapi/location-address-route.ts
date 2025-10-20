import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
    CreateLocationAddressResponseSchema,
    CreateLocationAddressSchema,
    LocationAddressSchema,
    GetLocationAddressSchema,
} from "../../types/Location";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { ILocationAddressService, LocationAddressService } from "../location-address/service";
import { ILocationAddressController, LocationAddressController } from "../location-address/controller";
import { ErrorResponseSchema } from "../../types/Utils";
import { openApiErrorCodes } from "../../utilities/error";
import { FEMALocationMatcher, IFEMALocationMatcher } from "../clients/fips-location-matching/service";

export const addOpenApiLocationAddressRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const locationAddressTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const locationMatcher: IFEMALocationMatcher = new FEMALocationMatcher();
    const locationAddressService: ILocationAddressService = new LocationAddressService(
        locationAddressTransaction,
        locationMatcher
    );
    const locationAddressController: ILocationAddressController = new LocationAddressController(locationAddressService);

    openApi.openapi(createLocationAddressRoute, (ctx) => locationAddressController.createLocationAddress(ctx));
    openApi.openapi(getLocationAddressRoute, (ctx) => locationAddressController.getLocationAddress(ctx));
    openApi.openapi(removeLocationAddressRoute, (ctx) => locationAddressController.removeLocationAddressById(ctx));
    return openApi;
};

const createLocationAddressRoute = createRoute({
    method: "post",
    path: "/location-address",
    summary: "Create an address for some location of a company",
    description: "Creates a new location address with the provided information",
    request: {
        body: {
            required: true,
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
                    schema: LocationAddressSchema,
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

const removeLocationAddressRoute = createRoute({
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
        400: {
            description: "Invalid location ID or no Company with that ID",
            content: {
                "application/json": {
                    schema: ErrorResponseSchema,
                },
            },
        },
    },
    tags: ["Location Address"],
});
