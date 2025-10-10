import { Context, TypedResponse } from "hono";
import { IPurchaseService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    GetCompanyPurchasesDTOSchema,
    CreateOrChangePurchaseDTOSchema,
    GetCompanyPurchasesResponse,
    GetPurchaseResponse,
    CreateOrChangePurchaseResponse,
} from "./types";
import { ControllerResponse } from "../../utilities/response";

export interface IPurchaseController {
    createOrUpdatePurchase(_ctx: Context): ControllerResponse<TypedResponse<CreateOrChangePurchaseResponse, 200>>;
    getPurchase(ctx: Context): ControllerResponse<TypedResponse<GetPurchaseResponse, 200>>;
    getPurchasesForCompany(ctx: Context): ControllerResponse<TypedResponse<GetCompanyPurchasesResponse, 200>>;
}

export class PurchaseController implements IPurchaseController {
    private PurchaseService: IPurchaseService;

    constructor(service: IPurchaseService) {
        this.PurchaseService = service;
    }

    createOrUpdatePurchase = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateOrChangePurchaseResponse, 200>> => {
            const json = await ctx.req.json();
            const payload = CreateOrChangePurchaseDTOSchema.parse(json);
            const updatedPurchase = await this.PurchaseService.createOrUpdatePurchase(payload);
            return ctx.json(updatedPurchase, 200);
        }
    );

    getPurchase = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetPurchaseResponse, 200>> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const fetchedPurchase = await this.PurchaseService.getPurchase(id);
            return ctx.json(fetchedPurchase, 200);
        }
    );

    getPurchasesForCompany = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyPurchasesResponse, 200>> => {
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
