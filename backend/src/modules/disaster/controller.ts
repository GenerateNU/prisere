import { Context, TypedResponse } from "hono";
import { withControllerErrorHandling } from "../../utilities/error";
import { IDisasterService } from "./service";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { CreateDisasterAPIResponse, CreateDisasterDTOSchema } from "../../types/disaster";

export interface IDisasterController {
    createDisaster(_ctx: Context): Promise<TypedResponse<CreateDisasterAPIResponse> | Response>;
    getAllDisasters(_ctx: Context): Promise<FemaDisaster[] | Response>;
}

export class DisasterController implements IDisasterController {
    private disasterService: IDisasterService;

    constructor(service: IDisasterService) {
        this.disasterService = service;
    }

    createDisaster = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<CreateDisasterAPIResponse>> => {
            const json = await ctx.req.json();
            const payload = CreateDisasterDTOSchema.parse(json);
            const disaster = await this.disasterService.createDisaster(payload);
            return ctx.json(disaster, 201);
        }
    );

    getAllDisasters = withControllerErrorHandling(async (ctx) => {
        const disaster = await this.disasterService.getAllDisasters();
        return ctx.json(disaster, 200);
    });



}
