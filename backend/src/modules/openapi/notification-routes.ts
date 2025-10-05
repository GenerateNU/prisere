import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import {
    GetUserNotificationPreferencesRequestParams,
    GetUserNotificationPreferencesSchema,
    UpdateUesrNotificationPreferencesDTOSchema,
    UpdateUserNotificationPreferencesRequestParams,
    UpdateUserNotificationPreferencesSchema,
    UserMissingErrorSchema,
} from "../../types/Preferences";
import { openApiErrorCodes } from "../../utilities/error";
import { NotificationTransaction } from "../notifications/transaction";
import { UserTransaction } from "../user/transaction";
import { NotificationService } from "../notifications/service";
import { NotificationController } from "../notifications/controller";

export const addOpenApiNotificationRoutes = (openApi: OpenAPIHono, db: DataSource) => {
    const transaction = new NotificationTransaction(db);
    const userTransaction = new UserTransaction(db);
    const service = new NotificationService(transaction, userTransaction);
    const controller = new NotificationController(service);

    openApi.openapi(getUserNotificationPreferencesRoute, (ctx) => controller.getUserPreferences(ctx));
    openApi.openapi(updateUserNotificationPreferencesRoute, (ctx) => controller.updateUserPreferences(ctx));

    return openApi;
};

const getUserNotificationPreferencesRoute = createRoute({
    method: "get",
    path: "/notifications/preferences/{id}",
    summary: "Get a user's notificiation preferences",
    request: {
        params: GetUserNotificationPreferencesRequestParams,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetUserNotificationPreferencesSchema,
                },
            },
            description: "Successfully retreived user preferences",
        },
        404: {
            content: {
                "application/json": {
                    schema: UserMissingErrorSchema,
                },
            },
            description: "User not found",
        },
        ...openApiErrorCodes("Get user notification preferences errors"),
    },
    tags: ["Notifications"],
});

const updateUserNotificationPreferencesRoute = createRoute({
    method: "put",
    path: "/notifications/preferences/{id}",
    summary: "Update a user's notificiation preferences",
    request: {
        params: UpdateUserNotificationPreferencesRequestParams,
        body: {
            content: {
                "application/json": {
                    schema: UpdateUesrNotificationPreferencesDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: UpdateUserNotificationPreferencesSchema,
                },
            },
            description: "Successfully updated user preferences",
        },
        404: {
            content: {
                "application/json": {
                    schema: UserMissingErrorSchema,
                },
            },
            description: "User not found",
        },
        ...openApiErrorCodes("Update user notification preferences errors"),
    },
    tags: ["Notifications"],
});
