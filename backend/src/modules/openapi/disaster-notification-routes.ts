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
    MarkReadNotificationResponseSchema,
    DismissNotificationResponseSchema,
} from "../../types/DisasterNotification";
import { z } from "zod";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { IPreferenceTransaction, PreferenceTransaction } from "../preferences/transaction";

export const addOpenApiDisasterNotificationRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const notificationTransaction = new DisasterNotificationTransaction(db);
    const locationTransaction: ILocationAddressTransaction = new LocationAddressTransactions(db);
    const userPreferencesTransaction: IPreferenceTransaction = new PreferenceTransaction(db);
    const notificationService = new DisasterNotificationService(
        notificationTransaction,
        locationTransaction,
        userPreferencesTransaction
    );
    const notificationController = new DisasterNotificationController(notificationService);

    openApi.openapi(getUserNotificationsRoute, (ctx) => notificationController.getUserNotifications(ctx) as any);
    openApi.openapi(markAsReadNotificationRoute, (ctx) => notificationController.markAsReadNotification(ctx) as any);
    openApi.openapi(markUnreadNotificationRoute, (ctx) => notificationController.markUnreadNotification(ctx) as any);
    openApi.openapi(bulkCreateNotificationsRoute, (ctx) => notificationController.bulkCreateNotifications(ctx) as any);
    openApi.openapi(deleteNotificationRoute, (ctx) => notificationController.deleteNotification(ctx) as any);
    openApi.openapi(markAllAsReadRoute, (ctx) => notificationController.markAllAsRead(ctx) as any);

    return openApi;
};

const markAllAsReadRoute = createRoute({
    method: "patch",
    path: "/disasterNotification/user/{id}/markAllAsRead",
    summary: "Mark all notifications as read",
    description: "Marks all unread notifications for a specific user as read",
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
                    schema: z.object({
                        success: z.boolean(),
                        updatedCount: z.number(),
                    }),
                },
            },
            description: "All notifications successfully marked as read",
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
            description: "User not found",
        },
    },
    tags: ["Disaster Notifications"],
});

const getUserNotificationsRoute = createRoute({
    method: "get",
    path: "/disasterNotification",
    summary: "Get user notifications",
    description: "Retrieves all disaster notifications for a specific user with optional filtering and pagination",
    request: {
        query: z.object({
            type: z.enum(["web", "email"]).optional(),
            status: z.enum(["unread", "read", "acknowledged"]).optional(),
            page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
            limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
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
            description: "Invalid user ID format or query parameters",
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

const markAsReadNotificationRoute = createRoute({
    method: "patch",
    path: "/disasterNotification/{id}/markAsRead",
    summary: "Mark notification as read",
    description: "Marks a specific notification as read and updates readAt timestamp",
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
                    schema: MarkReadNotificationResponseSchema,
                },
            },
            description: "Notification successfully marked as read",
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

const markUnreadNotificationRoute = createRoute({
    method: "patch",
    path: "/disasterNotification/{id}/markUnread",
    summary: "Mark notification as unread",
    description: "Marks a specific notification as unread and clears the readAt timestamp",
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
            description: "Notification successfully marked as unread",
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
    path: "/disasterNotification/bulk",
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
            description: "Notifications successfully created with createdAt timestamps",
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
    path: "/disasterNotification/{id}",
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
