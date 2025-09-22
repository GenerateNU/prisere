import { Hono } from "hono";
import { DataSource } from "typeorm";
import { QuickbooksController } from "./controller";
import { QuickbooksTransaction } from "./transaction";
import { QuickbooksService } from "./service";
import { QuickbooksClient } from "../../external/quickbooks/client";

export function quickbooksRoutes(db: DataSource) {
    const router = new Hono();

    const transaction = new QuickbooksTransaction(db);
    const client = new QuickbooksClient({
        clientId: process.env.QUICKBOOKS_CLIENT_ID!,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
        enviornment: "sandbox", // TODO: dev vs. prod
        redirectUri: "http://localhost:3001/quickbooks/redirect", // TODO: dev vs. prod, TODO: get a real frontend page to redirect to?
    });

    const service = new QuickbooksService(transaction, client);
    const controller = new QuickbooksController(service);

    router.get("/", (ctx) => controller.redirectToAuthorization(ctx));
    router.get("/redirect", async (ctx) => {
        // TODO: do a zod validator here? or in controller
        /* 
        queryParams: {
  code: [ "XAB11758485059iDGHLvhMCYLvAwk6Rw6oKLPYhqIzcf2Wxylh" ],
  state: [ "cqNl4IXn-GLDNrovM-GPwsGA-QstopRmIqho" ],
  realmId: [ "9341455368035451" ],
}
        */

        return controller.generateSession(ctx);
    });

    return router;
}
