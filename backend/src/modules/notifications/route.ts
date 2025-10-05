import { Hono } from "hono";
import { DataSource } from "typeorm";
import { NotificationController } from "./controller";
import { NotificationService } from "./service";
import { NotificationTransaction } from "./transaction";
import { UserTransaction } from "../user/transaction";

export const notificationRoutes = (db: DataSource) => {
    const hono = new Hono();

    const transaction = new NotificationTransaction(db);
    const userTransaction = new UserTransaction(db);
    const service = new NotificationService(transaction, userTransaction);
    const controller = new NotificationController(service);

    hono.get("/preferences/:id", (ctx) => controller.getUserPreferences(ctx));
    hono.put("/preferences/:id", (ctx) => controller.updateUserPreferences(ctx));

    return hono;
};
