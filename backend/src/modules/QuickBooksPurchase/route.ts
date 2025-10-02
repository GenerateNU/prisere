import { DataSource } from "typeorm";
import { Hono } from "hono";
import { IQuickBooksPurchaseController, QuickBooksPurchaseController } from "./controller";
import { IQuickBooksPurchaseService, QuickBooksPurchaseService } from "./service";
import { IQuickBooksPurchaseTransaction, QuickBooksPurchaseTransaction } from "./transaction";

export const purchaseRoutes = (db: DataSource): Hono => {
    const quickBooksPurchaseRoutes = new Hono();

    const quickbooksPurchaseTransaction: IQuickBooksPurchaseTransaction = new QuickBooksPurchaseTransaction(db);
    const quickBooksPurchaseService: IQuickBooksPurchaseService = new QuickBooksPurchaseService(
        quickbooksPurchaseTransaction
    );
    const quickBooksPurchaseController: IQuickBooksPurchaseController = new QuickBooksPurchaseController(
        quickBooksPurchaseService
    );

    quickBooksPurchaseRoutes.post("/quickbooks/purchase", (ctx) =>
        quickBooksPurchaseController.createQuickBooksPurchase(ctx)
    );
    quickBooksPurchaseRoutes.patch("/quickbooks/purchase/:id", (ctx) =>
        quickBooksPurchaseController.updateQuickBooksPurchase(ctx)
    );
    quickBooksPurchaseRoutes.get("/quickbooks/purchase/:id", (ctx) =>
        quickBooksPurchaseController.getQuickBooksPurchase(ctx)
    );
    quickBooksPurchaseRoutes.get("/quickbooks/purchases", (ctx) =>
        quickBooksPurchaseController.getQuickBooksPurchasesForCompany(ctx)
    );

    return quickBooksPurchaseRoutes;
};
