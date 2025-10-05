import { Hono } from "hono";
import { LocationAddressTransactions } from "./transaction";
import { LocationAddressService } from "./service";
import { LocationAddressController } from "./controller";
/**
 * Routes for the address of a location for some company.
 */
export const locationAddressRoute = (db) => {
    const locationAddress = new Hono();
    const locationAddressTransaction = new LocationAddressTransactions(db);
    const locationAddressService = new LocationAddressService(locationAddressTransaction);
    const locationAddressController = new LocationAddressController(locationAddressService);
    locationAddress.post("/", (ctx) => locationAddressController.createLocationAddress(ctx));
    locationAddress.get("/:id", (ctx) => locationAddressController.getLocationAddress(ctx));
    return locationAddress;
};
