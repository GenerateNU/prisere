import { withControllerErrorHandling } from "../../utilities/error";
import { CreateDisasterDTOSchema } from "../../types/disaster";
export class DisasterController {
    disasterService;
    constructor(service) {
        this.disasterService = service;
    }
    createDisaster = withControllerErrorHandling(async (ctx) => {
        const json = await ctx.req.json();
        const payload = CreateDisasterDTOSchema.parse(json);
        const disaster = await this.disasterService.createDisaster(payload);
        return ctx.json(disaster, 201);
    });
    getAllDisasters = withControllerErrorHandling(async (ctx) => {
        const disasters = await this.disasterService.getAllDisasters();
        return ctx.json(disasters.map(toDisasterDTO), 200);
    });
}
function toDisasterDTO(entity) {
    return {
        ...entity,
        declarationDate: entity.declarationDate.toISOString(),
        incidentBeginDate: entity.incidentBeginDate?.toISOString() ?? null,
        incidentEndDate: entity.incidentEndDate?.toISOString() ?? null,
    };
}
