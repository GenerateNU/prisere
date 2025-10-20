import { Context, TypedResponse } from "hono";
import { IInvoiceLineItemService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import { ControllerResponse } from "../../utilities/response";
import {
    CreateOrUpdateInvoiceLineItemsDTOSchema,
    CreateOrUpdateInvoiceLineItemsResponse,
    GetInvoiceLineItemResponse,
    GetInvoiceLineItemsByInvoiceResponse,
} from "../../types/InvoiceLineItem";

export interface IInvoiceLineItemController {
    bulkCreateOrUpdateInvoiceLineItems(
        _ctx: Context
    ): ControllerResponse<TypedResponse<CreateOrUpdateInvoiceLineItemsResponse, 201>>;
    getInvoiceLineItemById(ctx: Context): ControllerResponse<TypedResponse<GetInvoiceLineItemResponse, 200>>;
    getInvoiceLineItemsForInvoice(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetInvoiceLineItemsByInvoiceResponse, 200>>;
}

export class InvoiceLineItemController implements IInvoiceLineItemController {
    private invoiceLineItemService: IInvoiceLineItemService;

    constructor(service: IInvoiceLineItemService) {
        this.invoiceLineItemService = service;
    }

    bulkCreateOrUpdateInvoiceLineItems = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateOrUpdateInvoiceLineItemsResponse, 201>> => {
            const json = await ctx.req.json();
            const payload = CreateOrUpdateInvoiceLineItemsDTOSchema.parse(json);
            const createdQuickBooksInvoiceLineItems =
                await this.invoiceLineItemService.bulkCreateOrUpdateInvoiceLineItems(payload);
            return ctx.json(createdQuickBooksInvoiceLineItems, 201);
        }
    );

    getInvoiceLineItemById = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetInvoiceLineItemResponse, 200>> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid invoice line item ID format" }, 400);
            }

            const fetchedQuickBooksInvoiceLineItems = await this.invoiceLineItemService.getInvoiceLineItemById(id);
            return ctx.json(fetchedQuickBooksInvoiceLineItems, 200);
        }
    );

    getInvoiceLineItemsForInvoice = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetInvoiceLineItemsByInvoiceResponse, 200>> => {
            const id = ctx.req.param("id");

            if (!validate(id)) {
                return ctx.json({ error: "Invalid Invoice ID format" }, 400);
            }

            const fetchedQuickBooksInvoiceLineItems =
                await this.invoiceLineItemService.getInvoiceLineItemsForInvoice(id);
            return ctx.json(fetchedQuickBooksInvoiceLineItems, 200);
        }
    );
}
