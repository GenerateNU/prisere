import { withControllerErrorHandling } from "../../utilities/error";
import { CreateLocationAddressSchema, } from "../../types/Location";
import { validate } from "uuid";
// Rename the class to avoid naming conflict
export class LocationAddressController {
    locationAddressService;
    constructor(service) {
        this.locationAddressService = service;
    }
    /**
     * Will make request to the location address service to create a new location address
     * @param ctx The Hono Context
     * @returns The result of the location address creation or an error
     */
    getLocationAddress = withControllerErrorHandling(async (ctx) => {
        const maybeId = await ctx.req.param("id");
        if (!validate(maybeId)) {
            return ctx.json({ error: "An ID must be provided to get a location address" }, 400);
        }
        const resultingLocationAddress = await this.locationAddressService.getLocationAddress({
            id: maybeId,
        });
        return ctx.json(resultingLocationAddress, 200);
    });
    /**
     * Will make request to the location address service to get an existing location address
     * @param ctx The Hono Context
     * @returns The result of the location address fetching or an error
     */
    createLocationAddress = withControllerErrorHandling(async (ctx) => {
        const json = await ctx.req.json();
        const payload = CreateLocationAddressSchema.parse(json);
        const resultingLocationAddress = await this.locationAddressService.createLocationAddress(payload);
        return ctx.json(resultingLocationAddress, 201);
    });
}
