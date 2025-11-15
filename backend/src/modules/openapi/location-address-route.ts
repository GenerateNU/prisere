import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
    CreateLocationAddressResponseSchema,
    CreateLocationAddressSchema,
    LocationAddressSchema,
    GetLocationAddressSchema,
    CreateLocationAddressBulkSchema,
    CreateLocationAddressBulkResponseSchema,
    UpdateLocationAddressResponseSchema,
    UpdateLocationAddressDTOSchema,
    UpdateLocationAddressBulkDTOSchema,
    UpdateLocationAddressBulkResponseSchema,
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
    openApi.openapi(createLocationAddressBulkRoute, (ctx) => locationAddressController.createLocationAddressBulk(ctx));
    openApi.openapi(updateLocationAddress, (ctx) => locationAddressController.updateLocationAddressById(ctx));
    openApi.openapi(updateLocationAddressBulk, (ctx) => locationAddressController.updateLocationAddressBulk(ctx));

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

const createLocationAddressBulkRoute = createRoute({
    method: "post",
    path: "/location-address/bulk",
    summary: "Create many addresses for locations of a company",
    description: "Creates new location addresses with the provided information",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: CreateLocationAddressBulkSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateLocationAddressBulkResponseSchema,
                },
            },
            description: "Create location addresses response",
        },
        ...openApiErrorCodes("Error Creating Location Address"),
    },
    tags: ["Location Address"],
});

const updateLocationAddress = createRoute({
    method: "patch",
    path: "/location-address",
    summary: "Update the given location",
    description: "Updates the location address information for the location with the given id",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UpdateLocationAddressDTOSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: UpdateLocationAddressResponseSchema,
                },
            },
            description: "Location updated successfully",
        },
        ...openApiErrorCodes("Update Location Errors"),
    },
});

const updateLocationAddressBulk = createRoute({
    method: "patch",
    path: "/location-address/bulk",
    summary: "Update the given array of locations",
    description: "Updates the location address information for each of the given locations based on their id",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UpdateLocationAddressBulkDTOSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: UpdateLocationAddressBulkResponseSchema,
                },
            },
            description: "Location updated successfully",
        },
        ...openApiErrorCodes("Update Location Bulk Errors"),
    },
});
