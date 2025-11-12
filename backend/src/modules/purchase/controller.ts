import { Context, TypedResponse } from "hono";
import { IPurchaseService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    GetCompanyPurchasesDTOSchema,
    GetCompanyPurchasesResponse,
    GetPurchaseResponse,
    CreateOrChangePurchaseResponse,
    CreateOrChangePurchaseDTOSchema,
    CreateOrChangePurchaseRequest,
    GetCompanyPurchasesSummationResponse,
    GetCompanyPurchasesByDateDTOSchema,
    GetCompanyPurchasesInMonthBinsResponse,
    GetPurchaseCategoriesForCompanyResponse,
} from "./types";
import { ControllerResponse } from "../../utilities/response";

export interface IPurchaseController {
    createOrUpdatePurchase(_ctx: Context): ControllerResponse<TypedResponse<CreateOrChangePurchaseResponse, 200>>;
    getPurchase(ctx: Context): ControllerResponse<TypedResponse<GetPurchaseResponse, 200>>;
    getPurchasesForCompany(ctx: Context): ControllerResponse<TypedResponse<GetCompanyPurchasesResponse, 200>>;
    sumPurchasesByCompanyAndDateRange(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetCompanyPurchasesSummationResponse, 200>>;
    sumPurchasesByCompanyInMonthBins(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetCompanyPurchasesInMonthBinsResponse, 200>>;
    getPurchaseCategoriesForCompany(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetPurchaseCategoriesForCompanyResponse, 200>>;
}

export class PurchaseController implements IPurchaseController {
    private PurchaseService: IPurchaseService;

    constructor(service: IPurchaseService) {
        this.PurchaseService = service;
    }

    createOrUpdatePurchase = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateOrChangePurchaseResponse, 200>> => {
            const json = await ctx.req.json();
            const companyId = await ctx.get("companyId");

            if (!validate(companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const purchasesWithCompanyId = json.map((purchase: CreateOrChangePurchaseRequest) => ({
                ...purchase,
                companyId: companyId,
            }));

            const payload = CreateOrChangePurchaseDTOSchema.parse(purchasesWithCompanyId);
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
                companyId: ctx.get("companyId"),
                pageNumber: ctx.req.query("pageNumber") ? Number(ctx.req.query("pageNumber")) : undefined,
                resultsPerPage: ctx.req.query("resultsPerPage") ? Number(ctx.req.query("resultsPerPage")) : undefined,
                categories: ctx.req.queries("categories"),
                type: ctx.req.query("type"),
                dateFrom: ctx.req.query("dateFrom"),
                dateTo: ctx.req.query("dateTo"),
                search: ctx.req.query("search"),
                sortBy: ctx.req.query("sortBy"),
                sortOrder: ctx.req.query("sortOrder"),
            };

            const payload = GetCompanyPurchasesDTOSchema.parse(queryParams);

            if (!validate(payload.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            } else if (payload.dateFrom && payload.dateTo && new Date(payload.dateFrom) >= new Date(payload.dateTo)) {
                return ctx.json({ error: "Start date must be before End date" }, 400);
            }

            const fetchedPurchases = await this.PurchaseService.getPurchasesForCompany(payload);
            return ctx.json(fetchedPurchases, 200);
        }
    );

    sumPurchasesByCompanyAndDateRange = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyPurchasesSummationResponse, 200>> => {
            const queryParams = {
                companyId: ctx.get("companyId"),
                startDate: ctx.req.query("startDate"),
                endDate: ctx.req.query("endDate"),
            };
            const payload = GetCompanyPurchasesByDateDTOSchema.parse(queryParams);

            if (!validate(payload.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            } else if (new Date(payload.startDate) >= new Date(payload.endDate)) {
                return ctx.json({ error: "Start date must be before End date" }, 400);
            }

            const purchaseSummationAmount = await this.PurchaseService.sumPurchasesByCompanyAndDateRange(payload);
            return ctx.json({ total: purchaseSummationAmount }, 200);
        }
    );

    sumPurchasesByCompanyInMonthBins = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyPurchasesInMonthBinsResponse, 200>> => {
            const queryParams = {
                companyId: ctx.get("companyId"),
                startDate: ctx.req.query("startDate"),
                endDate: ctx.req.query("endDate"),
            };
            const payload = GetCompanyPurchasesByDateDTOSchema.parse(queryParams);

            if (!validate(payload.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            } else if (new Date(payload.startDate) >= new Date(payload.endDate)) {
                return ctx.json({ error: "Start date must be before End date" }, 400);
            }

            const perMonthSums = await this.PurchaseService.sumPurchasesByCompanyInMonthBins(payload);
            return ctx.json(perMonthSums, 200);
        }
    );

    getPurchaseCategoriesForCompany = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetPurchaseCategoriesForCompanyResponse, 200>> => {
            const companyId = ctx.get("companyId");
            if (!validate(companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }
            const categories = await this.PurchaseService.getPurchaseCategoriesForCompany(companyId);
            return ctx.json(categories, 200);
        }
    );
}
