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
    AcknowledgeNotificationResponse,
    DismissNotificationResponse
} from "../../types/DisasterNotification";
import { NotificationType } from "../../types/NotificationEnums";


export interface IDisasterNotificationController {
    getUserNotifications(ctx: Context): Promise<TypedResponse<GetUsersDisasterNotificationsResponse> | Response>;
    acknowledgeNotification(
        ctx: Context
    ): Promise<TypedResponse<AcknowledgeNotificationResponse | { error: string }> | Response>;
    dismissNotification(
        ctx: Context
    ): Promise<TypedResponse<DismissNotificationResponse | { error: string }> | Response>;
    bulkCreateNotifications(ctx: Context): Promise<TypedResponse<BulkCreateNotificationsResponse> | Response>;
    deleteNotification(ctx: Context): Promise<TypedResponse<DeleteNotificationResponse | { error: string }> | Response>;
}

export class DisasterNotificationController implements IDisasterNotificationController {
    private notificationService: IDisasterNotificationService;

    constructor(service: IDisasterNotificationService) {
        this.notificationService = service;
    }

    getUserNotifications = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetUsersDisasterNotificationsResponse>> => {
            const userId = ctx.req.param("id");
            if (!validate(userId)) {
                return ctx.json({ error: "Invalid user ID format" }, 400);
            }
            const payload = GetUsersDisasterNotificationsDTOSchema.parse({ id: userId });
            const notifications = await this.notificationService.getUserNotifications(payload);

            return ctx.json(notifications, 200);
        }
    );

    acknowledgeNotification = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<AcknowledgeNotificationResponse | { error: string }>> => {
        const notificationId = ctx.req.param("id");
        if (!validate(notificationId)) {
            return ctx.json({ error: "Invalid notification ID format" }, 400);
        }
        const notification = await this.notificationService.acknowledgeNotification(notificationId);
        return ctx.json(notification, 200);
    });

    dismissNotification = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<DismissNotificationResponse | { error: string }>> => {
        const notificationId = ctx.req.param("id");
        if (!validate(notificationId)) {
            return ctx.json({ error: "Invalid notification ID format" }, 400);
        }
        const notification = await this.notificationService.dismissNotification(notificationId);

        return ctx.json(notification, 200);
    });

    bulkCreateNotifications = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<BulkCreateNotificationsResponse>> => {
        const json = await ctx.req.json();
        const payload = BulkCreateNotificationsRequestSchema.parse(json);
        const convertedPayload = payload.map((item) => ({
            ...item,
            notificationType: NotificationType[item.notificationType.toUpperCase() as keyof typeof NotificationType],
        }));

        const created = await this.notificationService.bulkCreateNotifications(convertedPayload);

        return ctx.json(created, 201);
    });

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
