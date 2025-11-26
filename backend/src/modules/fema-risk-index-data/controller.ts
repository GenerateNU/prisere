import { Context, TypedResponse } from "hono";
import { withControllerErrorHandling } from "../../utilities/error";
import { IFemaRiskIndexService } from "./service";
import { FemaRiskIndexDataResult } from "./types";

export interface IFemaRiskIndex {
    updateFemaRiskIndexData(ctx: Context): Promise<TypedResponse<number, 200> | Response>;
    getFemaRiskIndexData(ctx: Context): Promise<TypedResponse<FemaRiskIndexDataResult, 200> | Response>;
}

export class FemaRiskIndexController implements IFemaRiskIndex {
    private femaRiskIndexService: IFemaRiskIndexService;

    constructor(service: IFemaRiskIndexService) {
        this.femaRiskIndexService = service;
    }

    updateFemaRiskIndexData = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<number, 200>> => {
        await this.femaRiskIndexService.updateFemaRiskIndexData();
        return ctx.json(1, 200);
    });

    getFemaRiskIndexData = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<FemaRiskIndexDataResult, 200>> => {
            const result = await this.femaRiskIndexService.getFemaRiskIndexData();
            return ctx.json(result, 200);
        }
    );
}
