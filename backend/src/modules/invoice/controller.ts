import { Context, TypedResponse } from "hono";
import { IInvoiceService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import { CreateOrUpdateInvoicesAPIResponse, GetInvoiceAPIResponse, GetCompanyInvoicesAPIResponse, CreateOrUpdateInvoicesDTOSchema, GetCompanyInvoicesDTOSchema } from "../../types/Invoice";

export interface IInvoiceController {
    bulkCreateOrUpdateInvoice(_ctx: Context): Promise<TypedResponse<CreateOrUpdateInvoicesAPIResponse> | Response>;
    getInvoice(ctx: Context): Promise<TypedResponse<GetInvoiceAPIResponse> | Response>;
    getInvoicesForCompany(
        ctx: Context
    ): Promise<TypedResponse<GetCompanyInvoicesAPIResponse> | Response>;
}

export class InvoiceController implements IInvoiceController {
    private invoiceService: IInvoiceService;

    constructor(service: IInvoiceService) {
        this.invoiceService = service;
    }

    bulkCreateOrUpdateInvoice = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<CreateOrUpdateInvoicesAPIResponse> | Response> => {
            const json = await ctx.req.json();
            const payload = CreateOrUpdateInvoicesDTOSchema.parse(json);
            const createdQuickBooksPurchase = await this.invoiceService.bulkCreateOrUpdateInvoice(payload);
            return ctx.json(createdQuickBooksPurchase, 201);
        }
    );

    getInvoice = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetInvoiceAPIResponse, 200> | Response> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid invoice ID format" }, 400);
            }

            const fetchedQuickBooksPurchase = await this.invoiceService.getInvoiceById(id);
            return ctx.json(fetchedQuickBooksPurchase, 200);
        }
    );

    getInvoicesForCompany = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetCompanyInvoicesAPIResponse, 200> | Response> => {
            const queryParams = {
                companyId: ctx.req.query('companyId'),
                pageNumber: ctx.req.query('pageNumber') ? Number(ctx.req.query('pageNumber')) : undefined,
                resultsPerPage: ctx.req.query('resultsPerPage') ? Number(ctx.req.query('resultsPerPage')) : undefined,
            };
            const payload = GetCompanyInvoicesDTOSchema.parse(queryParams);

            if (!validate(payload.companyId)) {
                return ctx.json({ error: "Invalid company ID format" }, 400);
            }

            const fetchedQuickBooksPurchases = await this.invoiceService.getInvoicesForCompany(payload);
            return ctx.json(fetchedQuickBooksPurchases, 200);
        }
    );
}