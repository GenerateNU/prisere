import { Context, TypedResponse } from "hono";
import { ControllerResponse } from "../../utilities/response";
import {
    GetClaimsByCompanyIdResponse,
    CreateClaimResponse,
    CreateClaimDTOSchema,
    DeleteClaimResponse,
} from "../../types/Claim";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import { IClaimService } from "./service";

export interface IClaimController {
    getClaimByCompanyId(_ctx: Context): ControllerResponse<TypedResponse<GetClaimsByCompanyIdResponse, 200>>;
    createClaim(_ctx: Context): ControllerResponse<TypedResponse<CreateClaimResponse, 201>>;
    deleteClaim(_ctx: Context): ControllerResponse<TypedResponse<DeleteClaimResponse, 200>>;
}

export class ClaimController {
    private claimService: IClaimService;

    constructor(service: IClaimService) {
        this.claimService = service;
    }

    getClaimByCompanyId = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetClaimsByCompanyIdResponse, 200>> => {
            const id = ctx.get("companyId");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const claimResponse = await this.claimService.getClaimsByCompanyId(id);

            return ctx.json(claimResponse, 200);
        }
    );

    createClaim = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateClaimResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateClaimDTOSchema.parse(json);
            const id = ctx.get("companyId");
            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const claim = await this.claimService.createClaim(payload, id);
            return ctx.json(claim, 201);
        }
    );

    deleteClaim = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<DeleteClaimResponse, 200>> => {
            const id = ctx.req.param("id");
            const comapnyId = ctx.get("companyId");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid claim ID format" }, 400);
            }
            const claim = await this.claimService.deleteClaim({ id: id }, comapnyId);
            return ctx.json(claim, 200);
        }
    );
}
