import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DisasterNotificationTransaction, IDisasterNotificationTransaction } from "../disasterNotifications.ts/transaction";
import { DisasterNotificationService, IDisasterNotificationService } from "../disasterNotifications.ts/service";
import { DisasterNotificationController, IDisasterNotificationController } from "../disasterNotifications.ts/controller";
import { setUpOpenApiRoutes } from "./all-routes";
import { BulkCreateNotificationsRequest, BulkCreateNotificationsRequestSchema, BulkCreateNotificationsResponseSchema } from "../../types/DisasterNotification"

export const addOpenApiDisasterNotificationRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const disasterNotificationTransaction: IDisasterNotificationTransaction = new DisasterNotificationTransaction(db);
    const disasterNotificationService: IDisasterNotificationService = new DisasterNotificationService(disasterNotificationTransaction);
    const disasterNotificationController: IDisasterNotificationController = new DisasterNotificationController(disasterNotificationService);
    openApi.openapi(createDisasterNotificationRoute, (ctx) => disasterNotificationController.bulkCreateNotifications(ctx))

    return openApi;
}

const createDisasterNotificationRoute = createRoute({ // ctx.json returns a Response
    method: "post",
    path: "/disasterNotifications",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsRequestSchema
                }
            }
        }
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsResponseSchema,
                },
            },
            description: "Company created successfully",
        },
        400: {
            description: "Bad Request - Invalid input data",
        },
    }
})