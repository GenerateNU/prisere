import { Context, TypedResponse } from "hono";
import { validate } from "uuid";
import { withControllerErrorHandling } from "../../utilities/error";
import { ControllerResponse } from "../../utilities/response";
import { ISelfDisasterService } from "./service";
import {
    CreateSelfDisasterDTOSchema,
    CreateSelfDisasterResponse,
    UpdateSelfDisasterDTOSchema,
    UpdateSelfDisasterResponse,
} from "./types";

export interface ISelfDisasterController {
    createSelfDisaster(_ctx: Context): ControllerResponse<TypedResponse<CreateSelfDisasterResponse, 201>>;
    deleteSelfDisaster(_ctx: Context): ControllerResponse<TypedResponse<void, 200>>;
    updateSelfDisaster(_ctx: Context): ControllerResponse<TypedResponse<UpdateSelfDisasterResponse, 200>>;
}

export class SelfDisasterController implements ISelfDisasterController {
    private disasterService: ISelfDisasterService;

    constructor(service: ISelfDisasterService) {
        this.disasterService = service;
    }

    createSelfDisaster = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateSelfDisasterResponse, 201>> => {
            const json = await ctx.req.json();
            const companyId = await ctx.get("companyId");
            const payload = CreateSelfDisasterDTOSchema.parse(json);
            const disaster = await this.disasterService.createSelfDisaster(payload, companyId);
            return ctx.json(disaster, 201);
        }
    );

    deleteSelfDisaster = withControllerErrorHandling(async (ctx: Context) => {
        const givenId = ctx.req.param("id");
        const companyId = await ctx.get("companyId");
        await this.disasterService.deleteSelfDisaster(givenId, companyId);
        return ctx.json(undefined, 200);
    });

    updateSelfDisaster = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<UpdateSelfDisasterResponse, 200>> => {
            const id = ctx.req.param("id");
            const companyId = await ctx.get("companyId");
            const json = await ctx.req.json();
            const payload = UpdateSelfDisasterDTOSchema.parse(json);

            if (!validate(id)) {
                return ctx.json({ error: "Invalid disaster ID format" }, 400);
            }

            const disaster = await this.disasterService.updateSelfDisaster(id, payload, companyId);
            return ctx.json(disaster, 200);
        }
    );
}
