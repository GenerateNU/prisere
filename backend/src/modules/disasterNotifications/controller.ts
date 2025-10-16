import { Context, TypedResponse } from "hono";
import { IDisasterNotificationService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    GetUsersDisasterNotificationsResponse,
    GetUsersDisasterNotificationsDTOSchema,
    BulkCreateNotificationsRequestSchema,
    BulkCreateNotificationsResponse,
    DeleteNotificationResponse,
    MarkReadNotificationResponse,
    DismissNotificationResponse,
    NotificationTypeFilter,
} from "../../types/DisasterNotification";
import { NotificationType } from "../../types/NotificationEnums";

export interface IDisasterNotificationController {
    getUserNotifications(ctx: Context): Promise<TypedResponse<GetUsersDisasterNotificationsResponse> | Response>;
    markAsReadNotification(
        ctx: Context
    ): Promise<TypedResponse<MarkReadNotificationResponse | { error: string }> | Response>;
    markUnreadNotification(
        ctx: Context
    ): Promise<TypedResponse<DismissNotificationResponse | { error: string }> | Response>;
    bulkCreateNotifications(ctx: Context): Promise<TypedResponse<BulkCreateNotificationsResponse> | Response>;
    deleteNotification(ctx: Context): Promise<TypedResponse<DeleteNotificationResponse | { error: string }> | Response>;
    markAllAsRead(ctx: Context): Promise<TypedResponse<{ success: boolean; updatedCount: number } | { error: string }>>;
}

export class DisasterNotificationController implements IDisasterNotificationController {
    private notificationService: IDisasterNotificationService;

    constructor(service: IDisasterNotificationService) {
        this.notificationService = service;
    }

    getUserNotifications = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetUsersDisasterNotificationsResponse>> => {
            const userId = ctx.get("userId");
            const type = ctx.req.query("type"); // ?type=web or type=email
            const page = parseInt(ctx.req.query("page") || "1");
            const limit = parseInt(ctx.req.query("limit") || "20");
            const status = ctx.req.query("status"); // read, unread
            if (page < 1) {
                return ctx.json({ error: "Page must be greater than 0" }, 400);
            }
            if (limit < 1 || limit > 100) {
                return ctx.json({ error: "Limit must be between 1 and 100" }, 400);
            }
            if (isNaN(page) || isNaN(limit)) {
                return ctx.json({ error: "Page and limit must be valid numbers" }, 400);
            }
            if (type && !["web", "email"].includes(type)) {
                return ctx.json({ error: "Type must be 'web' or 'email' (or not provided)" }, 400);
            }
            if (!validate(userId)) {
                return ctx.json({ error: "Invalid user ID format" }, 400);
            }
            if (status && status !== "read" && status !== "unread") {
                return ctx.json({ error: "Status must be 'read' 'unread' or 'read'" }, 400);
            }
            const payload = GetUsersDisasterNotificationsDTOSchema.parse({ id: userId });
            const notificationType = type as NotificationTypeFilter;
            const notifications = await this.notificationService.getUserNotifications(
                payload,
                notificationType,
                page,
                limit,
                status
            );

            return ctx.json(notifications, 200);
        }
    );

    markAsReadNotification = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<MarkReadNotificationResponse | { error: string }>> => {
            const notificationId = ctx.req.param("id");
            if (!validate(notificationId)) {
                return ctx.json({ error: "Invalid notification ID format" }, 400);
            }
            const notification = await this.notificationService.markAsReadNotification(notificationId);
            return ctx.json(notification, 200);
        }
    );

    markAllAsRead = withControllerErrorHandling(
        async (
            ctx: Context
        ): Promise<TypedResponse<{ success: boolean; updatedCount: number } | { error: string }>> => {
            // const userId = ctx.req.param("id");
            const userId = ctx.get("userId");

            if (!validate(userId)) {
                return ctx.json({ error: "Invalid user ID format" }, 400);
            }

            const updatedCount = await this.notificationService.markAllAsRead(userId);

            return ctx.json({ success: true, updatedCount }, 200);
        }
    );

    markUnreadNotification = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<DismissNotificationResponse | { error: string }>> => {
            const notificationId = ctx.req.param("id");
            if (!validate(notificationId)) {
                return ctx.json({ error: "Invalid notification ID format" }, 400);
            }
            const notification = await this.notificationService.markUnreadNotification(notificationId);

            return ctx.json(notification, 200);
        }
    );

    bulkCreateNotifications = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<BulkCreateNotificationsResponse>> => {
            const json = await ctx.req.json();
            const payload = BulkCreateNotificationsRequestSchema.parse(json);
            const convertedPayload = payload.map((item) => ({
                ...item,
                notificationType:
                    NotificationType[item.notificationType.toUpperCase() as keyof typeof NotificationType],
            }));

            const created = await this.notificationService.bulkCreateNotifications(convertedPayload);

            return ctx.json(created, 201);
        }
    );

    deleteNotification = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<DeleteNotificationResponse | { error: string }>> => {
            const notificationId = ctx.req.param("id");
            if (!validate(notificationId)) {
                return ctx.json({ error: "Invalid notification ID format" }, 400);
            }
            const success = await this.notificationService.deleteNotification(notificationId);
            return ctx.json({ success, deletedId: notificationId }, success ? 200 : 404);
        }
    );
}
