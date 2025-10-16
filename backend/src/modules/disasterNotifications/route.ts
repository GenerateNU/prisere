import { DataSource } from "typeorm";
import { Hono } from "hono";
import { DisasterNotificationTransaction, IDisasterNotificationTransaction } from "./transaction";
import { DisasterNotificationService, IDisasterNotificationService } from "./service";
import { DisasterNotificationController, IDisasterNotificationController } from "./controller";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { IPreferenceTransaction, PreferenceTransaction } from "../preferences/transaction";

export const disasterNotificationRoutes = (db: DataSource): Hono => {
    const disasterNotification = new Hono();

    const disasterNotificationTransaction: IDisasterNotificationTransaction = new DisasterNotificationTransaction(db);
    const locationTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const userPreferencesTransaction: IPreferenceTransaction = new PreferenceTransaction(db);
    const disasterNotificationService: IDisasterNotificationService = new DisasterNotificationService(
        disasterNotificationTransaction,
        locationTransaction,
        userPreferencesTransaction
    );
    const disasterNotificationController: IDisasterNotificationController = new DisasterNotificationController(
        disasterNotificationService
    );

    disasterNotification.get("/", (ctx) => disasterNotificationController.getUserNotifications(ctx));
    disasterNotification.patch("/:id/acknowledge", (ctx) =>
        disasterNotificationController.acknowledgeNotification(ctx)
    );
    disasterNotification.patch("/:id/dismiss", (ctx) => disasterNotificationController.dismissNotification(ctx));
    disasterNotification.post("/create", (ctx) => disasterNotificationController.bulkCreateNotifications(ctx));
    disasterNotification.delete("/:id", (ctx) => disasterNotificationController.deleteNotification(ctx));

    return disasterNotification;
};
