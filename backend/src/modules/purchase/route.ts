import { DataSource } from "typeorm";
import { Hono } from "hono";
import { IPurchaseController, PurchaseController } from "./controller";
import { IPurchaseService, PurchaseService } from "./service";
import { IPurchaseTransaction, PurchaseTransaction } from "./transaction";
import { purchaseLineItemsRoutes } from "../purchase-line-item/route";

export const purchaseRoutes = (db: DataSource): Hono => {
    const PurchaseRoutes = new Hono();

    const transaction: IPurchaseTransaction = new PurchaseTransaction(db);
    const service: IPurchaseService = new PurchaseService(transaction);
    const controller: IPurchaseController = new PurchaseController(service);

    //Add the line item routes
    purchaseLineItemsRoutes(db, PurchaseRoutes);

    PurchaseRoutes.post("/", (ctx) => controller.createOrUpdatePurchase(ctx));
    PurchaseRoutes.get("/:id", (ctx) => controller.getPurchase(ctx));
    PurchaseRoutes.get("/", (ctx) => controller.getPurchasesForCompany(ctx));

    return PurchaseRoutes;
};
