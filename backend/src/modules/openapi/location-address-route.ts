import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { ILocationAddressService, LocationAddressService } from "../location-address/service";
import { ILocationAddressController, LocationAddressController } from "../location-address/controller";
import { createLocationAddressRoute, getLocationAddressRoute, removeLocationAddressRoute } from "@prisere/types";

export const addOpenApiLocationAddressRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const locationAddressTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const locationAddressService: ILocationAddressService = new LocationAddressService(locationAddressTransaction);
    const locationAddressController: ILocationAddressController = new LocationAddressController(locationAddressService);

    openApi.openapi(createLocationAddressRoute, (ctx) => locationAddressController.createLocationAddress(ctx));
    openApi.openapi(getLocationAddressRoute, (ctx) => locationAddressController.getLocationAddress(ctx));
    openApi.openapi(removeLocationAddressRoute, (ctx) => locationAddressController.removeLocationAddressById(ctx));
    return openApi;
};