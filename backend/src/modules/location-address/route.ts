import { DataSource } from "typeorm";
import { Hono } from "hono";
import { ILocationAddressTransaction, LocationAddressTransactions } from "./transaction";
import { ILocationAddressService, LocationAddressService } from "./service";
import { ILocationAddressController, LocationAddressController } from "./controller";
import { FEMALocationMatcher, IFEMALocationMatcher } from "../clients/fips-location-matching/service";

/**
 * Routes for the address of a location for some company.
 */
export const locationAddressRoute = (db: DataSource): Hono => {
    const locationAddress = new Hono();

    const locationAddressTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const locationMatcher: IFEMALocationMatcher = new FEMALocationMatcher();
    const locationAddressService: ILocationAddressService = new LocationAddressService(
        locationAddressTransaction,
        locationMatcher
    );
    const locationAddressController: ILocationAddressController = new LocationAddressController(locationAddressService);

    locationAddress.post("/", (ctx) => locationAddressController.createLocationAddress(ctx));
    locationAddress.post("/bulk", (ctx) => locationAddressController.createLocationAddressBulk(ctx));
    locationAddress.get("/:id", (ctx) => locationAddressController.getLocationAddress(ctx));
    locationAddress.delete("/:id", (ctx) => locationAddressController.removeLocationAddressById(ctx));

    return locationAddress;
};
