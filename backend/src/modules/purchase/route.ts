import { Hono } from "hono";
import { DataSource } from "typeorm";
import { purchaseLineItemsRoutes } from "../purchase-line-item/route";
import { IPurchaseController, PurchaseController } from "./controller";
import { IPurchaseService, PurchaseService } from "./service";
import { IPurchaseTransaction, PurchaseTransaction } from "./transaction";

export const purchaseRoutes = (db: DataSource): Hono => {
    const PurchaseRoutes = new Hono();

    const transaction: IPurchaseTransaction = new PurchaseTransaction(db);
    const service: IPurchaseService = new PurchaseService(transaction);
    const controller: IPurchaseController = new PurchaseController(service);

    purchaseLineItemsRoutes(db, PurchaseRoutes);

    PurchaseRoutes.post("/bulk", (ctx) => controller.createOrUpdatePurchase(ctx));

    PurchaseRoutes.get("/", (ctx) => controller.getPurchasesForCompany(ctx));
    PurchaseRoutes.get("/bulk/totalExpenses", (ctx) => controller.sumPurchasesByCompanyAndDateRange(ctx));
    PurchaseRoutes.get("/bulk/months", (ctx) => controller.sumPurchasesByCompanyInMonthBins(ctx));
    PurchaseRoutes.get("/categories", (ctx) => controller.getPurchaseCategoriesForCompany(ctx));

    PurchaseRoutes.get("/:id", (ctx) => controller.getPurchase(ctx));

    return PurchaseRoutes;
};
