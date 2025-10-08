import { OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { DisasterNotificationTransaction } from "../disasterNotifications/transaction";
import { DisasterNotificationService } from "../disasterNotifications/service";
import { DisasterNotificationController } from "../disasterNotifications/controller";
import {getUserNotificationsRoute, acknowledgeNotificationRoute, dismissNotificationRoute, bulkCreateNotificationsRoute, deleteNotificationRoute} from "@prisere/types";

export const addOpenApiDisasterNotificationRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const notificationTransaction = new DisasterNotificationTransaction(db);
    const notificationService = new DisasterNotificationService(notificationTransaction);
    const notificationController = new DisasterNotificationController(notificationService);

    openApi.openapi(getUserNotificationsRoute, (ctx) => notificationController.getUserNotifications(ctx) as any);
    openApi.openapi(acknowledgeNotificationRoute, (ctx) => notificationController.acknowledgeNotification(ctx) as any);
    openApi.openapi(dismissNotificationRoute, (ctx) => notificationController.dismissNotification(ctx) as any);
    openApi.openapi(bulkCreateNotificationsRoute, (ctx) => notificationController.bulkCreateNotifications(ctx) as any);
    openApi.openapi(deleteNotificationRoute, (ctx) => notificationController.deleteNotification(ctx) as any);

    return openApi;
};