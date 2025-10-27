import { Context, TypedResponse } from "hono";
import { IPurchaseLineItemService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    CreateOrChangePurchaseLineItemsDTOSchema,
    CreateOrChangePurchaseLineItemsResponse,
    GetPurchaseLineItemsFromParentResponse,
    GetPurchaseLineItemResponse,
    UpdatePurchaseLineItemResponse,
    UpdatePurchaseLineItemDTOSchema,
} from "./types";
import { ControllerResponse } from "../../utilities/response";
import { logObjectToFile } from "../../utilities/logger";

export interface IPurchaseLineItemController {
    createOrUpdatePurchaseLineItems(
        _ctx: Context
    ): ControllerResponse<TypedResponse<CreateOrChangePurchaseLineItemsResponse, 200>>;
    getPurchaseLineItem(ctx: Context): ControllerResponse<TypedResponse<GetPurchaseLineItemResponse, 200>>;
    getPurchaseLineItemsForPurchase(
        ctx: Context
    ): ControllerResponse<TypedResponse<GetPurchaseLineItemsFromParentResponse, 200>>;

    updatePurchaseLineItemCategory(ctx: Context): ControllerResponse<TypedResponse<UpdatePurchaseLineItemResponse, 200>>;
}

export class PurchaseLineItemController implements IPurchaseLineItemController {
    private purchaseLineItemService: IPurchaseLineItemService;

    constructor(service: IPurchaseLineItemService) {
        this.purchaseLineItemService = service;
    }

    createOrUpdatePurchaseLineItems = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateOrChangePurchaseLineItemsResponse, 200>> => {
            try {
                const json = await ctx.req.json();
                const payload = CreateOrChangePurchaseLineItemsDTOSchema.parse(json);
                const updatedPurchaseLineItems =
                    await this.purchaseLineItemService.createOrUpdatePurchaseLineItems(payload);
                return ctx.json(updatedPurchaseLineItems, 200);
            } catch (err: unknown) {
                logObjectToFile(err as any);
                throw err;
            }
        }
    );

    getPurchaseLineItem = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetPurchaseLineItemResponse, 200>> => {
            const maybePurchaseLineItemId = await ctx.req.param("id");

            if (!validate(maybePurchaseLineItemId)) {
                return ctx.json({ error: "The given ID is not well formed" }, 400);
            }

            const fetchedPurchaseLineItem =
                await this.purchaseLineItemService.getPurchaseLineItem(maybePurchaseLineItemId);
            return ctx.json(fetchedPurchaseLineItem, 200);
        }
    );

    getPurchaseLineItemsForPurchase = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetPurchaseLineItemsFromParentResponse, 200>> => {
            const maybePurchaseId = await ctx.req.param("id");

            if (!validate(maybePurchaseId)) {
                return ctx.json({ error: "The given ID is not well formed" }, 400);
            }

            const fetchedPurchaseLineItem =
                await this.purchaseLineItemService.getPurchaseLineItemsForPurchase(maybePurchaseId);
            return ctx.json(fetchedPurchaseLineItem, 200);
        }
    );



    updatePurchaseLineItemCategory = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<UpdatePurchaseLineItemResponse, 200>> => {
            const json = await ctx.req.json();
            const request = UpdatePurchaseLineItemDTOSchema.parse(json);

            const updated = 
            await this.purchaseLineItemService.updatePurchaseLineItemCategory(request.id, request.category);

            return ctx.json(updated, 200);

        }
    );
    
}
