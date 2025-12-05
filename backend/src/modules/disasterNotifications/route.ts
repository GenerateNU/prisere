import { Hono } from "hono";
import { DataSource } from "typeorm";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { IPreferenceTransaction, PreferenceTransaction } from "../preferences/transaction";
import { ISQSService, SQSService } from "../sqs/service";
import { DisasterNotificationController, IDisasterNotificationController } from "./controller";
import { DisasterNotificationService, IDisasterNotificationService } from "./service";
import { DisasterNotificationTransaction, IDisasterNotificationTransaction } from "./transaction";

export const disasterNotificationRoutes = (db: DataSource): Hono => {
    const notifications = new Hono();

    const disasterNotificationTransaction: IDisasterNotificationTransaction = new DisasterNotificationTransaction(db);
    const locationTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const userPreferencesTransaction: IPreferenceTransaction = new PreferenceTransaction(db);
    const sqsService: ISQSService = new SQSService();
    const disasterNotificationService: IDisasterNotificationService = new DisasterNotificationService(
        disasterNotificationTransaction,
        locationTransaction,
        userPreferencesTransaction,
        sqsService
    );
    const disasterNotificationController: IDisasterNotificationController = new DisasterNotificationController(
        disasterNotificationService
    );

    notifications.get("/", (ctx) => disasterNotificationController.getUserNotifications(ctx)); // removed user ID
    notifications.get("/unread", (ctx) => disasterNotificationController.getUserUnreadNotifications(ctx));
    notifications.patch("/:id/markAsRead", (ctx) => disasterNotificationController.markAsReadNotification(ctx));
    notifications.patch("/:id/markUnread", (ctx) => disasterNotificationController.markUnreadNotification(ctx));
    notifications.post("/create", (ctx) => disasterNotificationController.bulkCreateNotifications(ctx));
    notifications.delete("/:id", (ctx) => disasterNotificationController.deleteNotification(ctx));
    notifications.patch("/user/markAllAsRead", (ctx) => disasterNotificationController.markAllAsRead(ctx)); // removed user ID
    notifications.get("/unread", (ctx) => disasterNotificationController.getUserUnreadNotifications(ctx));

    return notifications;
};
