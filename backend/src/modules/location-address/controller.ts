import { Context, TypedResponse } from "hono";
import { ILocationAddressService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import {
    CreateLocationAddressResponse,
    CreateLocationAddressSchema,
    GetLocationAddressResponse,
} from "../../types/Location";
import { validate } from "uuid";
import { ControllerResponse } from "../../utilities/response";

export interface ILocationAddressController {
    /**
     * Will make request to the location address service to create a new location address
     * @param ctx The Hono Context
     * @returns The result of the location address creation or an error
     */
    createLocationAddress(ctx: Context): ControllerResponse<TypedResponse<CreateLocationAddressResponse, 201>>;

    /**
     * Will make request to the location address service to get an existing location address
     * @param ctx The Hono Context
     * @returns The result of the location address fetching or an error
     */
    getLocationAddress(ctx: Context): ControllerResponse<TypedResponse<GetLocationAddressResponse, 200>>;
}

// Rename the class to avoid naming conflict
export class LocationAddressController implements ILocationAddressController {
    private locationAddressService: ILocationAddressService;

    constructor(service: ILocationAddressService) {
        this.locationAddressService = service;
    }

    /**
     * Will make request to the location address service to create a new location address
     * @param ctx The Hono Context
     * @returns The result of the location address creation or an error
     */
    getLocationAddress = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetLocationAddressResponse, 200>> => {
            const maybeId = await ctx.req.param("id");

            if (!validate(maybeId)) {
                return ctx.json({ error: "An ID must be provided to get a location address" }, 400);
            }
            const resultingLocationAddress = await this.locationAddressService.getLocationAddress({
                id: maybeId,
            });
            return ctx.json(resultingLocationAddress, 200);
        }
    );

    /**
     * Will make request to the location address service to get an existing location address
     * @param ctx The Hono Context
     * @returns The result of the location address fetching or an error
     */
    createLocationAddress = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateLocationAddressResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateLocationAddressSchema.parse(json);
            const resultingLocationAddress = await this.locationAddressService.createLocationAddress(payload);
            return ctx.json(resultingLocationAddress, 201);
        }
    );
}
