import { Hono } from "hono";
import { DataSource } from "typeorm";
import { PreferencesController } from "./controller";
import { PreferenceService } from "./service";
import { PreferenceTransaction } from "./transaction";
import { UserTransaction } from "../user/transaction";

export const preferenceRoutes = (db: DataSource) => {
    const hono = new Hono();

    const transaction = new PreferenceTransaction(db);
    const userTransaction = new UserTransaction(db);
    const service = new PreferenceService(transaction, userTransaction);
    const controller = new PreferencesController(service);

    hono.get("/", (ctx) => controller.getUserPreferences(ctx));
    hono.put("/", (ctx) => controller.updateUserPreferences(ctx));

    return hono;
};
