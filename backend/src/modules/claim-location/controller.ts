import { Context, TypedResponse } from "hono";
import { ControllerResponse } from "../../utilities/response";
import { ClaimLocation, CreateClaimLocationDTOSchema, DeleteClaimLocationResponse } from "../../types/ClaimLocation";
import { LocationAddress } from "../../types/Location";
import { IClaimLocationService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";

export interface IClaimLocationController {
    createClaimLocation(_ctx: Context): ControllerResponse<TypedResponse<ClaimLocation, 201>>;
    getLocationsByCompanyId(_ctx: Context): ControllerResponse<TypedResponse<LocationAddress[], 200>>;
    deleteClaimLocationById(_ctx: Context): ControllerResponse<TypedResponse<DeleteClaimLocationResponse, 200>>;
}

export class ClaimLocationController implements IClaimLocationController {
    private companyService: IClaimLocationService;

    constructor(service: IClaimLocationService) {
        this.companyService = service;
    }

    getLocationsByCompanyId = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<LocationAddress[], 200>> => {
            const companyId = ctx.get("companyId");
            if (!validate(companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const locations = await this.companyService.getLocationsByCompanyId(companyId);
            return ctx.json(locations, 200);
        }
    );

    deleteClaimLocationById = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<DeleteClaimLocationResponse, 200>> => {
            const cid = ctx.req.param("cid");
            const lid = ctx.req.param("lid");

            const deleteResponse = await this.companyService.deleteClaimLocationsById({
                claimId: cid,
                locationId: lid,
            });
            return ctx.json(deleteResponse, 200);
        }
    );

    createClaimLocation = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<ClaimLocation, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateClaimLocationDTOSchema.parse(json);
            const claimLocation = await this.companyService.createClaimLocation(payload);
            return ctx.json(claimLocation, 201);
        }
    );
}
