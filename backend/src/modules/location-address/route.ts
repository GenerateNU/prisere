import { DataSource } from "typeorm";
import { Hono } from "hono";
import { ILocationAddressTransaction, LocationAddressTransactions } from "./transaction";
import { ILocationAddressService, LocationAddressService } from "./service";
import { ILocationAddressController, LocationAddressController } from "./controller";

/**
 * Routes for the address of a location for some company.
 */
export const locationAddressRoute = (db: DataSource): Hono => {
    const locationAddress = new Hono();
    const defaultPath = `/location-address`;

    const locationAddressTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const locationAddressService: ILocationAddressService = new LocationAddressService(locationAddressTransaction);
    const locationAddressController: ILocationAddressController = new LocationAddressController(locationAddressService);

    locationAddress.post("/", (ctx) => locationAddressController.createLocationAddress(ctx));
    locationAddress.get("/", (ctx) => locationAddressController.getLocationAddress(ctx));

    return locationAddress;
};
