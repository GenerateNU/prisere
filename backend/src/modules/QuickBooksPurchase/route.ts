import { DataSource } from "typeorm";
import { Hono } from "hono";
import { IPurchaseController, PurchaseController } from "./controller";
import { IPurchaseService, PurchaseService } from "./service";
import { IPurchaseTransaction, PurchaseTransaction } from "./transaction";

export const purchaseRoutes = (db: DataSource): Hono => {
    const PurchaseRoutes = new Hono();

    const PurchaseTransaction: IPurchaseTransaction = new PurchaseTransaction(db);
    const PurchaseService: IPurchaseService = new PurchaseService(PurchaseTransaction);
    const PurchaseController: IPurchaseController = new PurchaseController(PurchaseService);

    PurchaseRoutes.post("/quickbooks/purchase", (ctx) => PurchaseController.createPurchase(ctx));
    PurchaseRoutes.patch("/quickbooks/purchase/:id", (ctx) => PurchaseController.updatePurchase(ctx));
    PurchaseRoutes.get("/quickbooks/purchase/:id", (ctx) => PurchaseController.getPurchase(ctx));
    PurchaseRoutes.get("/quickbooks/purchases", (ctx) => PurchaseController.getPurchasesForCompany(ctx));

    return PurchaseRoutes;
};
