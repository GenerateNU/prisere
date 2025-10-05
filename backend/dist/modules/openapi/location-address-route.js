import { createRoute } from "@hono/zod-openapi";
import { CreateLocationAddressResponseSchema, CreateLocationAddressSchema, GetLocationAddressResponseSchema, GetLocationAddressSchema, } from "../../types/Location";
import { LocationAddressTransactions } from "../location-address/transaction";
import { LocationAddressService } from "../location-address/service";
import { LocationAddressController } from "../location-address/controller";
import { openApiErrorCodes } from "../../utilities/error";
export const addOpenApiLocationAddressRoutes = (openApi, db) => {
    const locationAddressTransaction = new LocationAddressTransactions(db);
    const locationAddressService = new LocationAddressService(locationAddressTransaction);
    const locationAddressController = new LocationAddressController(locationAddressService);
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
            description: "The associated location address for the given information",
        },
        404: {
            description: "The given UUID does not have an associated location address in the database",
        },
        ...openApiErrorCodes("Error Getting Location Address"),
    },
    tags: ["Location Address"],
});
