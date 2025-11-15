import { Context, TypedResponse } from "hono";
import { IInvoiceService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    CreateOrUpdateInvoicesResponse,
    GetInvoiceResponse,
    GetCompanyInvoicesResponse,
    CreateOrUpdateInvoicesDTOSchema,
    GetCompanyInvoicesDTOSchema,
    GetCompanyInvoicesByDateDTOSchema,
    GetCompanyInvoicesSummationResponse,
    GetCompanyInvoicesInMonthBinsResponse,
    CreateOrUpdateInvoicesRequest,
} from "../../types/Invoice";
import { ControllerResponse } from "../../utilities/response";

export interface IInvoiceController {
    bulkCreateOrUpdateInvoice(_ctx: Context): ControllerResponse<TypedResponse<CreateOrUpdateInvoicesResponse, 201>>;
    getInvoice(ctx: Context): ControllerResponse<TypedResponse<GetInvoiceResponse, 200>>;
    getInvoicesForCompany(ctx: Context): ControllerResponse<TypedResponse<GetCompanyInvoicesResponse, 200>>;
    sumInvoicesByCompanyAndDateRange(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetCompanyInvoicesSummationResponse, 200>>;
    sumInvoicesByCompanyInMonthBins(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetCompanyInvoicesInMonthBinsResponse, 200>>;
}

export class InvoiceController implements IInvoiceController {
    private invoiceService: IInvoiceService;

    constructor(service: IInvoiceService) {
        this.invoiceService = service;
    }

    bulkCreateOrUpdateInvoice = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateOrUpdateInvoicesResponse, 201>> => {
            const json = await ctx.req.json();
            const companyId = await ctx.get("companyId");
            const invoicesWithCompanyId = json.items.map((invoice: CreateOrUpdateInvoicesRequest) => ({
                ...invoice,
                companyId: companyId,
            }));
            const payload = CreateOrUpdateInvoicesDTOSchema.parse(invoicesWithCompanyId);

            const createdQuickBooksPurchase = await this.invoiceService.bulkCreateOrUpdateInvoice(payload);
            return ctx.json(createdQuickBooksPurchase, 201);
        }
    );

    getInvoice = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetInvoiceResponse, 200>> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid invoice ID format" }, 400);
            }

            const fetchedQuickBooksPurchase = await this.invoiceService.getInvoiceById(id);
            return ctx.json(fetchedQuickBooksPurchase, 200);
        }
    );

    getInvoicesForCompany = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyInvoicesResponse, 200>> => {
            const queryParams = {
                companyId: ctx.get("companyId"),
                pageNumber: ctx.req.query("pageNumber") ? Number(ctx.req.query("pageNumber")) : undefined,
                resultsPerPage: ctx.req.query("resultsPerPage") ? Number(ctx.req.query("resultsPerPage")) : undefined,
            };
            const payload = GetCompanyInvoicesDTOSchema.parse(queryParams);

            if (!validate(payload.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const fetchedQuickBooksPurchases = await this.invoiceService.getInvoicesForCompany(payload);
            return ctx.json(fetchedQuickBooksPurchases, 200);
        }
    );

    sumInvoicesByCompanyAndDateRange = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyInvoicesSummationResponse, 200>> => {
            const queryParams = {
                companyId: ctx.get("companyId"),
                startDate: ctx.req.query("startDate"),
                endDate: ctx.req.query("endDate"),
            };
            const payload = GetCompanyInvoicesByDateDTOSchema.parse(queryParams);

            if (!validate(payload.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            } else if (new Date(payload.startDate) >= new Date(payload.endDate)) {
                return ctx.json({ error: "Start date must be before End date" }, 400);
            }

            const invoiceSummationAmount = await this.invoiceService.sumInvoicesByCompanyAndDateRange(payload);
            return ctx.json({ total: invoiceSummationAmount }, 200);
        }
    );

    sumInvoicesByCompanyInMonthBins = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetCompanyInvoicesInMonthBinsResponse, 200>> => {
            const queryParams = {
                companyId: ctx.get("companyId"),
                startDate: ctx.req.query("startDate"),
                endDate: ctx.req.query("endDate"),
            };
            const payload = GetCompanyInvoicesByDateDTOSchema.parse(queryParams);

            if (!validate(payload.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            } else if (new Date(payload.startDate) >= new Date(payload.endDate)) {
                return ctx.json({ error: "Start date must be before End date" }, 400);
            }

            const perMonthSums = await this.invoiceService.sumInvoicesByCompanyInMonthBins(payload);
            return ctx.json(perMonthSums, 200);
        }
    );
}
