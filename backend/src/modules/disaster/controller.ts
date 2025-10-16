import { Context, TypedResponse } from "hono";
import { withControllerErrorHandling } from "../../utilities/error";
import { IDisasterService } from "./service";
import { CreateDisasterDTOSchema, CreateDisasterResponse, GetAllDisastersResponse } from "../../types/fema-disaster";
import { ControllerResponse } from "../../utilities/response";
import { FemaDisaster } from "../../entities/FemaDisaster";

export interface IDisasterController {
    createDisaster(_ctx: Context): ControllerResponse<TypedResponse<CreateDisasterResponse, 201>>;
    getAllDisasters(_ctx: Context): ControllerResponse<TypedResponse<GetAllDisastersResponse, 200>>;
}

export class DisasterController implements IDisasterController {
    private disasterService: IDisasterService;

    constructor(service: IDisasterService) {
        this.disasterService = service;
    }

    createDisaster = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateDisasterResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateDisasterDTOSchema.parse(json);
            const disaster = await this.disasterService.createDisaster(payload);
            return ctx.json(disaster, 201);
        }
    );

    getAllDisasters = withControllerErrorHandling(
        async (ctx): ControllerResponse<TypedResponse<GetAllDisastersResponse, 200>> => {
            const disasters = await this.disasterService.getAllDisasters();
            return ctx.json(disasters.map(toDisasterDTO), 200);
        }
    );
}

function toDisasterDTO(entity: FemaDisaster): GetAllDisastersResponse[number] {
    return {
        ...entity,
        declarationDate: entity.declarationDate.toISOString(),
        incidentBeginDate: entity.incidentBeginDate?.toISOString() ?? null,
        incidentEndDate: entity.incidentEndDate?.toISOString() ?? null,
    };
}
