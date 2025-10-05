import { Context, TypedResponse } from "hono";
import { IPurchaseService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    CreatePurchaseAPIResponse,
    CreatePurchaseDTOSchema,
    GetCompanyPurchasesAPIResponse,
    GetPurchaseAPIResponse,
    PatchPurchaseDTOSchema,
    PatchPurchaseAPIResponse,
    GetCompanyPurchasesDTOSchema,
} from "./types";

export interface IPurchaseController {
    updatePurchase(_ctx: Context): Promise<TypedResponse<PatchPurchaseAPIResponse> | Response>;
    createPurchase(_ctx: Context): Promise<TypedResponse<CreatePurchaseAPIResponse> | Response>;
    getPurchase(ctx: Context): Promise<TypedResponse<GetPurchaseAPIResponse> | Response>;
    getPurchasesForCompany(ctx: Context): Promise<TypedResponse<GetCompanyPurchasesAPIResponse> | Response>;
}

export class PurchaseController implements IPurchaseController {
    private PurchaseService: IPurchaseService;

    constructor(service: IPurchaseService) {
        this.PurchaseService = service;
    }

    updatePurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<PatchPurchaseAPIResponse> | Response> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const json = await ctx.req.json();
            const payload = PatchPurchaseDTOSchema.parse(json);
            const updatedPurchase = await this.PurchaseService.updatePurchase(id, payload);
            return ctx.json(updatedPurchase, 201);
        }
    );

    createPurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<CreatePurchaseAPIResponse> | Response> => {
            const json = await ctx.req.json();
            const payload = CreatePurchaseDTOSchema.parse(json);
            const createdPurchase = await this.PurchaseService.createPurchase(payload);
            return ctx.json(createdPurchase, 201);
        }
    );

    getPurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetPurchaseAPIResponse> | Response> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const fetchedPurchase = await this.PurchaseService.getPurchase(id);
            return ctx.json(fetchedPurchase, 201);
        }
    );

    getPurchasesForCompany = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetCompanyPurchasesAPIResponse> | Response> => {
            //TODO: We need some way of passing the user's compmany ID with the session that is safe
            const json = await ctx.req.json();
            const payload = GetCompanyPurchasesDTOSchema.parse(json);
            const fetchedPurchases = await this.PurchaseService.getPurchasesForCompany(payload);
            return ctx.json(fetchedPurchases, 201);
        }
    );
}
