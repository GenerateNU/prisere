import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DisasterNotificationTransaction, IDisasterNotificationTransaction } from "../disasterNotifications/transaction";
import { DisasterNotificationService, IDisasterNotificationService } from "../disasterNotifications/service";
import { DisasterNotificationController, IDisasterNotificationController } from "../disasterNotifications/controller";
import { BulkCreateNotificationsRequestSchema, BulkCreateNotificationsResponseSchema } from "../../types/DisasterNotification";

// Add more schemas as needed for other routes
// import { DisasterNotificationResponseSchema, ... } from "../../types/DisasterNotification";

export const addOpenApiDisasterNotificationRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const disasterNotificationTransaction: IDisasterNotificationTransaction = new DisasterNotificationTransaction(db);
    const disasterNotificationService: IDisasterNotificationService = new DisasterNotificationService(disasterNotificationTransaction);
    const disasterNotificationController: IDisasterNotificationController = new DisasterNotificationController(disasterNotificationService);

    openApi.openapi(createDisasterNotificationRoute, (ctx) => disasterNotificationController.bulkCreateNotifications(ctx));

    openApi.openapi(getUserDisasterNotificationsRoute, (ctx) => disasterNotificationController.getUserNotifications(ctx));

    openApi.openapi(markNotificationReadRoute, (ctx) => disasterNotificationController.dismissNotification(ctx));

    openApi.openapi(acknowledgeNotificationRoute, (ctx) => disasterNotificationController.acknowledgeNotification(ctx));
    openApi.openapi(deleteNotificationRoute, (ctx) => disasterNotificationController.deleteNotification(ctx));


    return openApi;
};

const createDisasterNotificationRoute = createRoute({
    method: "post",
    path: "/disasterNotifications",
    summary: "Bulk create disaster notifications",
    description: "Creates multiple disaster notifications for users based on provided user and disaster IDs.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsRequestSchema,
                    examples: [
                        {
                            userId: "uuid-of-user",
                            femaDisasterId: "uuid-of-disaster",
                            notificationType: "web"
                        }
                    ]
                }
            },
            description: "Array of notification objects to create. Each must include userId, femaDisasterId, and notificationType."
        }
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsResponseSchema,
                },
            },
            description: "Notifications created successfully",
        },
        400: {
            description: "Bad Request - Invalid input data, such as malformed UUIDs or missing fields",
            content: {
                "application/json": {
                    example: { error: "Invalid UUID format for userId" }
                }
            }
        },
        404: {
            description: "Not Found - User or disaster not found for provided IDs",
            content: {
                "application/json": {
                    example: { error: "User not found for userId" }
                }
            }
        },
        500: {
            description: "Internal Server Error - Unexpected error during creation",
            content: {
                "application/json": {
                    example: { error: "Failed to insert some notifications." }
                }
            }
        }
    },
    tags: ["DisasterNotifications"],
});

const getUserDisasterNotificationsRoute = createRoute({
    method: "get",
    path: "/disasterNotifications/user/{userId}",
    summary: "Get all disaster notifications for a user",
    description: "Retrieves all disaster notifications for the specified user.",
    request: {
        params: {
            userId: {
                type: "string",
                description: "UUID of the user"
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsResponseSchema
                }
            },
            description: "List of disaster notifications for the user",
        },
        404: {
            description: "User not found",
            content: {
                "application/json": {
                    example: { error: "User not found" }
                }
            }
        },
        400: {
            description: "Bad Request - Invalid input data, such as malformed UUIDs or missing fields",
            content: {
                "application/json": {
                    example: { error: "Invalid UUID format" }
                }
            }
        },
    },
    tags: ["DisasterNotifications"],
});

const markNotificationReadRoute = createRoute({
    method: "patch",
    path: "/disasterNotifications/{notificationId}/read",
    summary: "Mark a disaster notification as read",
    description: "Marks the specified disaster notification as read.",
    request: {
        params: {
            notificationId: {
                type: "string",
                description: "UUID of the notification"
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsResponseSchema,
                }
            },
            description: "Notification marked as read",
        },
        404: {
            description: "Notification not found",
            content: {
                "application/json": {
                    example: { error: "Notification not found" }
                }
            }
        },
        400: {
            description: "Bad Request - Invalid input data, such as malformed UUIDs or missing fields",
            content: {
                "application/json": {
                    example: { error: "Invalid UUID format" }
                }
            }
        },
    },
    tags: ["DisasterNotifications"],
});

const acknowledgeNotificationRoute = createRoute({
    method: "patch",
    path: "/disasterNotifications/{notificationId}/acknowledge",
    summary: "Acknowledge a disaster notification",
    description: "Marks the specified disaster notification as acknowledged.",
    request: {
        params: {
            notificationId: {
                type: "string",
                description: "UUID of the notification"
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsResponseSchema,
                }
            },
            description: "Notification acknowledged",
        },
        404: {
            description: "Notification not found",
            content: {
                "application/json": {
                    example: { error: "Notification not found" }
                }
            }
        },
        400: {
            description: "Bad Request - Invalid input data, such as malformed UUIDs or missing fields",
            content: {
                "application/json": {
                    example: { error: "Invalid UUID format" }
                }
            }
        },
    },
    tags: ["DisasterNotifications"],
};

const deleteNotificationRoute = createRoute({
    method: "delete",
    path: "/disasterNotifications/{notificationId}",
    summary: "Deleted a disaster notification",
    description: "Deletes the specified disaster notification.",
    request: {
        params: {
            notificationId: {
                type: "string",
                description: "UUID of the notification"
            }
        }
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: BulkCreateNotificationsResponseSchema,
                }
            },
            description: "Notification deleted",
        },
        404: {
            description: "Notification not found",
            content: {
                "application/json": {
                    example: { error: "Notification not found" }
                }
            }
        },
        400: {
            description: "Bad Request - Invalid input data, such as malformed UUIDs or missing fields",
            content: {
                "application/json": {
                    example: { error: "Invalid UUID format" }
                }
            }
        },
    },
    tags: ["DisasterNotifications"],
};