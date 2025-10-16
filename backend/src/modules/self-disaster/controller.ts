import { Context, TypedResponse } from "hono";
import { withControllerErrorHandling } from "../../utilities/error";
import { ControllerResponse } from "../../utilities/response";
import { CreateSelfDisasterDTOSchema, CreateSelfDisasterResponse } from "./types";
import { ISelfDisasterService } from "./service";

export interface ISelfDisasterController {
    createSelfDisaster(_ctx: Context): ControllerResponse<TypedResponse<CreateSelfDisasterResponse, 201>>;
    deleteSelfDisaster(_ctx: Context): ControllerResponse<TypedResponse<void, 200>>;
}

export class SelfDisasterController implements ISelfDisasterController {
    private disasterService: ISelfDisasterService;

    constructor(service: ISelfDisasterService) {
        this.disasterService = service;
    }

    createSelfDisaster = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateSelfDisasterResponse, 201>> => {
            const json = await ctx.req.json();
            try {
                const payload = CreateSelfDisasterDTOSchema.parse(json);
                const disaster = await this.disasterService.createSelfDisaster(payload);
                return ctx.json(disaster, 201);
            } catch (err) {
                console.log(err);
                throw err;
            }
        }
    );

    deleteSelfDisaster = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<void, 200>> => {
            const givenId = ctx.req.param("id");
            await this.disasterService.deleteSelfDisaster(givenId);
            return ctx.json(undefined, 200);
        }
    );
}
