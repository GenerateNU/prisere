import { Hono } from "hono";
import { DataSource } from "typeorm";
import { QuickbooksController } from "./controller";
import { QuickbooksTransaction } from "./transaction";
import { QuickbooksService } from "./service";
import { QuickbooksClient } from "../../external/quickbooks/client";
import { UserTransaction } from "../user/transaction";
import { InvoiceTransaction } from "../invoice/transaction";
import { InvoiceLineItemTransaction } from "../invoiceLineItem/transaction";
import { PurchaseTransaction } from "../purchase/transaction";
import { PurchaseLineItemTransaction } from "../purchase-line-item/transaction";

export function quickbooksRoutes(db: DataSource) {
    const router = new Hono();

    const transaction = new QuickbooksTransaction(db);
    const userTransaction = new UserTransaction(db);
    const invoiceTransaction = new InvoiceTransaction(db);
    const invoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
    const purchaseTransaction = new PurchaseTransaction(db);
    const purchaseLineItemTransaction = new PurchaseLineItemTransaction(db);
    const client = new QuickbooksClient({
        clientId: process.env.QUICKBOOKS_CLIENT_ID!,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
        environment: process.env.NODE_ENV === "development" ? "sandbox" : "production",
    });

    const service = new QuickbooksService(
        transaction,
        userTransaction,
        invoiceTransaction,
        invoiceLineItemTransaction,
        purchaseTransaction,
        purchaseLineItemTransaction,
        client
    );
    const controller = new QuickbooksController(service);

    router.get("/", (ctx) => controller.redirectToAuthorization(ctx));
    router.get("/redirect", async (ctx) => controller.generateSession(ctx));
    router.post("/importQuickbooksData", async (ctx) => controller.importQuickbooksData(ctx));

    return router;
}
