import { Context, TypedResponse } from "hono";
import { IPurchaseService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    GetCompanyPurchasesAPIResponse,
    GetPurchaseAPIResponse,
    GetCompanyPurchasesDTOSchema,
    CreateOrPatchPurchaseAPIResponse,
    CreateOrPatchPurchaseDTO,
    PatchPurchaseDTO,
    CreatePurchaseDTO,
} from "./types";

export interface IPurchaseController {
    createOrUpdatePurchase(_ctx: Context): Promise<TypedResponse<CreateOrPatchPurchaseAPIResponse> | Response>;
    getPurchase(ctx: Context): Promise<TypedResponse<GetPurchaseAPIResponse> | Response>;
    getPurchasesForCompany(ctx: Context): Promise<TypedResponse<GetCompanyPurchasesAPIResponse> | Response>;
}

export class PurchaseController implements IPurchaseController {
    private PurchaseService: IPurchaseService;

    constructor(service: IPurchaseService) {
        this.PurchaseService = service;
    }

    createOrUpdatePurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<CreateOrPatchPurchaseAPIResponse> | Response> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const json = await ctx.req.json();
            const payload = CreateOrPatchPurchaseDTO.parse(json);

            let updatedPurchase;
            if ("id" in payload) {
                const typedPayload: PatchPurchaseDTO = payload as PatchPurchaseDTO;
                updatedPurchase = await this.PurchaseService.updatePurchase(id, typedPayload);
            } else {
                const typedPayload: CreatePurchaseDTO = payload as CreatePurchaseDTO;
                updatedPurchase = await this.PurchaseService.createPurchase(typedPayload);
            }

            return ctx.json(updatedPurchase, 201);
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
