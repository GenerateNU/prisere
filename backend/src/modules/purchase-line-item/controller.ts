import { Context, TypedResponse } from "hono";
import { IPurchaseLineItemService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    CreateOrChangePurchaseLineItemsDTOSchema,
    CreateOrChangePurchaseLineItemsResponse,
    GetPurchaseLineItemsFromParentResponse,
    GetPurchaseLineItemResponse,
} from "./types";
import { ControllerResponse } from "../../utilities/response";

export interface IPurchaseLineItemController {
    createOrUpdatePurchaseLineItems(
        _ctx: Context
    ): ControllerResponse<TypedResponse<CreateOrChangePurchaseLineItemsResponse, 200>>;
    getPurchaseLineItem(ctx: Context): ControllerResponse<TypedResponse<GetPurchaseLineItemResponse, 200>>;
    getPurchaseLineItemsForPurchase(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetPurchaseLineItemsFromParentResponse, 200>>;
}

export class PurchaseLineItemController implements IPurchaseLineItemController {
    private purchaseLineItemService: IPurchaseLineItemService;

    constructor(service: IPurchaseLineItemService) {
        this.purchaseLineItemService = service;
    }

    createOrUpdatePurchaseLineItems = withControllerErrorHandling(async (ctx: Context) => {
        const json = await ctx.req.json();
        const payload = CreateOrChangePurchaseLineItemsDTOSchema.parse(json);
        const updatedPurchaseLineItems = await this.purchaseLineItemService.createOrUpdatePurchaseLineItems(payload);
        return ctx.json(updatedPurchaseLineItems, 200);
    });

    getPurchaseLineItem = withControllerErrorHandling(async (ctx: Context) => {
        const maybePurchaseLineItemId = await ctx.req.param("id");

        if (!validate(maybePurchaseLineItemId)) {
            return ctx.json({ error: "The given ID is not well formed" }, 400);
        }

        const fetchedPurchaseLineItem = await this.purchaseLineItemService.getPurchaseLineItem(maybePurchaseLineItemId);
        return ctx.json(fetchedPurchaseLineItem, 200);
    });

    getPurchaseLineItemsForPurchase = withControllerErrorHandling(async (ctx: Context) => {
        const maybePurchaseId = await ctx.req.param("id");

        if (!validate(maybePurchaseId)) {
            return ctx.json({ error: "The given ID is not well formed" }, 400);
        }

        const fetchedPurchaseLineItem =
            await this.purchaseLineItemService.getPurchaseLineItemsForPurchase(maybePurchaseId);
        return ctx.json(fetchedPurchaseLineItem, 200);
    });
}
