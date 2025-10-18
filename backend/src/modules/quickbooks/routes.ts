import { Hono } from "hono";
import { DataSource } from "typeorm";
import { QuickbooksController } from "./controller";
import { QuickbooksTransaction } from "./transaction";
import { QuickbooksService } from "./service";
import { QuickbooksClient } from "../../external/quickbooks/client";
import { UserTransaction } from "../user/transaction";

export function quickbooksRoutes(db: DataSource) {
    const router = new Hono();

    const transaction = new QuickbooksTransaction(db);
    const userTransaction = new UserTransaction(db);
    const client = new QuickbooksClient({
        clientId: process.env.QUICKBOOKS_CLIENT_ID!,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
        environment: "sandbox", // TODO: dev vs. prod
    });

    const service = new QuickbooksService(transaction, userTransaction, client);
    const controller = new QuickbooksController(service);

    router.get("/", (ctx) => controller.redirectToAuthorization(ctx));
    router.get("/redirect", async (ctx) => controller.generateSession(ctx));

    // TODO: probably not make this an actual endpoint
    router.get("/invoices", (ctx) => controller.getUnprocessedInvoices(ctx));

    return router;
}
