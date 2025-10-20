import { DataSource } from "typeorm";
import { Hono } from "hono";
import { IPurchaseLineItemController, PurchaseLineItemController } from "./controller";
import { IPurchaseLineItemService, PurchaseLineItemService } from "./service";
import { IPurchaseLineItemTransaction, PurchaseLineItemTransaction } from "./transaction";

/**
 * Mutates the given Hono routes to add PurchaseLineItem realated routes under the "/purchase/..." path
 * @param db The datasource used to interact with the database
 * @param PurchaseRoutes The hono routes that are extended with this module
 * @returns A new set of routes
 */
export const purchaseLineItemsRoutes = (db: DataSource, PurchaseRoutes: Hono): Hono => {
    const transaction: IPurchaseLineItemTransaction = new PurchaseLineItemTransaction(db);
    const service: IPurchaseLineItemService = new PurchaseLineItemService(transaction);
    const controller: IPurchaseLineItemController = new PurchaseLineItemController(service);

    PurchaseRoutes.post("/line/bulk", (ctx) => controller.createOrUpdatePurchaseLineItems(ctx));
    PurchaseRoutes.get("/line/:id", (ctx) => controller.getPurchaseLineItem(ctx));
    PurchaseRoutes.get("/:id/lines", (ctx) => controller.getPurchaseLineItemsForPurchase(ctx));

    return PurchaseRoutes;
};
