import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import { DisasterNotificationTransaction } from "../disasterNotifications/transaction";
import { DisasterNotificationService } from "../disasterNotifications/service";
import { DisasterNotificationController } from "../disasterNotifications/controller";
import {
    GetUsersDisasterNotificationsResponseSchema,
    BulkCreateNotificationsRequestSchema,
    BulkCreateNotificationsResponseSchema,
    DeleteNotificationResponseSchema,
    AcknowledgeNotificationResponseSchema,
    DismissNotificationResponseSchema,
} from "../../types/DisasterNotification";
import { z } from "zod";

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

const getUserNotificationsRoute = createRoute({
    method: "get",
    path: "/notifications/user/{id}",
    summary: "Get user notifications",
    description: "Retrieves all disaster notifications for a specific user",
    request: {
        params: z.object({
            id: z
                .string()
                .uuid()
                .openapi({
                    param: {
                        name: "id",
                        in: "path",
                    },
                    example: "123e4567-e89b-12d3-a456-426614174000",
                }),
        }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetUsersDisasterNotificationsResponseSchema,
                },
            },
            description: "Successfully retrieved user notifications",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Invalid user ID format",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "User not found or no notifications found",
        },
    },
    tags: ["Disaster Notifications"],
});

const acknowledgeNotificationRoute = createRoute({
    method: "patch",
    path: "/notifications/{id}/acknowledge",
    summary: "Acknowledge notification",
    description: "Marks a specific notification as acknowledged",
    request: {
        params: z.object({
            id: z
                .string()
                .uuid()
                .openapi({
                    param: {
                        name: "id",
                        in: "path",
                    },
                    example: "123e4567-e89b-12d3-a456-426614174000",
                }),
        }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: AcknowledgeNotificationResponseSchema,
                },
            },
            description: "Notification successfully acknowledged",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Invalid notification ID format",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Notification not found",
        },
    },
    tags: ["Disaster Notifications"],
});

const dismissNotificationRoute = createRoute({
    method: "patch",
    path: "/notifications/{id}/dismiss",
    summary: "Dismiss notification",
    description: "Marks a specific notification as read/dismissed",
    request: {
        params: z.object({
            id: z
                .string()
                .uuid()
                .openapi({
                    param: {
                        name: "id",
                        in: "path",
                    },
                    example: "123e4567-e89b-12d3-a456-426614174000",
                }),
        }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: DismissNotificationResponseSchema,
                },
            },
            description: "Notification successfully dismissed",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Invalid notification ID format",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Notification not found",
        },
    },
    tags: ["Disaster Notifications"],
});

const bulkCreateNotificationsRoute = createRoute({
    method: "post",
    path: "/notifications/bulk",
    summary: "Bulk create notifications",
    description: "Creates multiple disaster notifications at once for impacted users",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsRequestSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsResponseSchema,
                },
            },
            description: "Notifications successfully created",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Invalid request payload or UUID format",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "User or FEMA Disaster not found",
        },
        500: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Failed to insert some notifications",
        },
    },
    tags: ["Disaster Notifications"],
});

const deleteNotificationRoute = createRoute({
    method: "delete",
    path: "/notifications/{id}",
    summary: "Delete notification",
    description: "Permanently deletes a specific notification",
    request: {
        params: z.object({
            id: z
                .string()
                .uuid()
                .openapi({
                    param: {
                        name: "id",
                        in: "path",
                    },
                    example: "123e4567-e89b-12d3-a456-426614174000",
                }),
        }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: DeleteNotificationResponseSchema,
                },
            },
            description: "Notification successfully deleted",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Invalid notification ID format",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Notification not found",
        },
    },
    tags: ["Disaster Notifications"],
});
