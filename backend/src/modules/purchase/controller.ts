import { Context, TypedResponse } from "hono";
import { IPurchaseService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    GetCompanyPurchasesAPIResponse,
    GetPurchaseAPIResponse,
    GetCompanyPurchasesDTOSchema,
    CreateOrPatchPurchaseAPIResponse,
    CreateOrPatchPurchaseDTOUnionSchema,
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
            const json = await ctx.req.json();
            const payload = CreateOrPatchPurchaseDTOUnionSchema.parse(json);

            if ("purchaseId" in payload) {
                if (!validate(payload.purchaseId)) {
                    return ctx.json({ error: "Invalid company ID format" }, 400);
                }

                const typedPayload: PatchPurchaseDTO = payload as PatchPurchaseDTO;
                const updatedPurchase = await this.PurchaseService.updatePurchase(typedPayload);
                return ctx.json(updatedPurchase, 200);
            } else {
                const typedPayload: CreatePurchaseDTO = payload as CreatePurchaseDTO;
                const newPurchase = await this.PurchaseService.createPurchase(typedPayload);
                return ctx.json(newPurchase, 201);
            }
        }
    );

    getPurchase = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetPurchaseAPIResponse> | Response> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const fetchedPurchase = await this.PurchaseService.getPurchase(id);
            return ctx.json(fetchedPurchase, 200);
        }
    );

    getPurchasesForCompany = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetCompanyPurchasesAPIResponse> | Response> => {
            const queryParams = {
                companyId: ctx.req.query("companyId"),
                pageNumber: ctx.req.query("pageNumber") ? Number(ctx.req.query("pageNumber")) : undefined,
                resultsPerPage: ctx.req.query("resultsPerPage") ? Number(ctx.req.query("resultsPerPage")) : undefined,
            };

            if (!validate(queryParams.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const payload = GetCompanyPurchasesDTOSchema.parse(queryParams);
            const fetchedPurchases = await this.PurchaseService.getPurchasesForCompany(payload);
            return ctx.json(fetchedPurchases, 200);
        }
    );
}
