import { Context, TypedResponse } from "hono";
import { IQuickBooksPurchaseService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    CreateQuickBooksPurchaseAPIResponse,
    CreateQuickBooksPurchaseDTOSchema,
    GetCompanyQuickBooksPurchasesAPIResponse,
    GetQuickBooksPurchaseAPIResponse,
    PatchQuickBooksPurchaseDTOSchema,
    PatchQuickBooksPurchaseAPIResponse,
    GetCompanyQuickBooksPurchasesDTOSchema,
} from "./types";

export interface IQuickBooksPurchaseController {
    updateQuickBooksPurchase(_ctx: Context): Promise<TypedResponse<PatchQuickBooksPurchaseAPIResponse> | Response>;
    createQuickBooksPurchase(_ctx: Context): Promise<TypedResponse<CreateQuickBooksPurchaseAPIResponse> | Response>;
    getQuickBooksPurchase(ctx: Context): Promise<TypedResponse<GetQuickBooksPurchaseAPIResponse> | Response>;
    getQuickBooksPurchasesForCompany(
        ctx: Context
    ): Promise<TypedResponse<GetCompanyQuickBooksPurchasesAPIResponse> | Response>;
}

export class QuickBooksPurchaseController implements IQuickBooksPurchaseController {
    private quickBooksPurchaseService: IQuickBooksPurchaseService;

    constructor(service: IQuickBooksPurchaseService) {
        this.quickBooksPurchaseService = service;
    }

    updateQuickBooksPurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<PatchQuickBooksPurchaseAPIResponse> | Response> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const json = await ctx.req.json();
            const payload = PatchQuickBooksPurchaseDTOSchema.parse(json);
            const updatedQuickBooksPurchase = await this.quickBooksPurchaseService.updateQuickBooksPurchase(
                id,
                payload
            );
            return ctx.json(updatedQuickBooksPurchase, 201);
        }
    );

    createQuickBooksPurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<CreateQuickBooksPurchaseAPIResponse> | Response> => {
            const json = await ctx.req.json();
            const payload = CreateQuickBooksPurchaseDTOSchema.parse(json);
            const createdQuickBooksPurchase = await this.quickBooksPurchaseService.createQuickBooksPurchase(payload);
            return ctx.json(createdQuickBooksPurchase, 201);
        }
    );

    getQuickBooksPurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetQuickBooksPurchaseAPIResponse> | Response> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const fetchedQuickBooksPurchase = await this.quickBooksPurchaseService.getQuickBooksPurchase(id);
            return ctx.json(fetchedQuickBooksPurchase, 201);
        }
    );

    getQuickBooksPurchasesForCompany = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetCompanyQuickBooksPurchasesAPIResponse> | Response> => {
            //TODO: We need some way of passing the user's compmany ID with the session that is safe
            const json = await ctx.req.json();
            const payload = GetCompanyQuickBooksPurchasesDTOSchema.parse(json);
            const fetchedQuickBooksPurchases =
                await this.quickBooksPurchaseService.getQuickBooksPurchasesForCompany(payload);
            return ctx.json(fetchedQuickBooksPurchases, 201);
        }
    );
}
