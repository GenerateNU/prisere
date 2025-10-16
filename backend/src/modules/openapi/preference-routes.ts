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
import { PreferenceTransaction } from "../preferences/transaction";
import { UserTransaction } from "../user/transaction";
import { PreferenceService } from "../preferences/service";
import { PreferencesController } from "../preferences/controller";

export const addOpenApiPreferenceRoutes = (openApi: OpenAPIHono, db: DataSource) => {
    const transaction = new PreferenceTransaction(db);
    const userTransaction = new UserTransaction(db);
    const service = new PreferenceService(transaction, userTransaction);
    const controller = new PreferencesController(service);

    openApi.openapi(getUserNotificationPreferencesRoute, (ctx) => controller.getUserPreferences(ctx));
    openApi.openapi(updateUserNotificationPreferencesRoute, (ctx) => controller.updateUserPreferences(ctx));

    return openApi;
};

const getUserNotificationPreferencesRoute = createRoute({
    method: "get",
    path: "/notifications/preferences",
    summary: "Get a user's notificiation preferences",
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
    tags: ["Preferences"],
});

const updateUserNotificationPreferencesRoute = createRoute({
    method: "put",
    path: "/notifications/preferences",
    summary: "Update a user's notificiation preferences",
    request: {
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
    tags: ["Preferences"],
});
