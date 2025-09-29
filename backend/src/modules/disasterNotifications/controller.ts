import { Context, TypedResponse } from "hono";
import { IDisasterNotificationService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import {
    GetUsersDisasterNotificationsResponse,
    GetUsersDisasterNotificationsDTOSchema,
    DisasterNotification,
    BulkCreateNotificationsRequestSchema,
    BulkCreateNotificationsResponse,
    DeleteNotificationResponse,
    AcknowledgeNotificationResponse,
    DismissNotificationResponse,
    GetUsersDisasterNotificationsResponseSchema,
    BulkCreateNotificationsResponseSchema,
} from "../../types/DisasterNotification";
import { NotificationType } from "../../entities/DisasterNotification";

export interface IDisasterNotificationController {
    getUserNotifications(ctx: Context): Promise<TypedResponse<GetUsersDisasterNotificationsResponse> | Response>;
    acknowledgeNotification(ctx: Context): Promise<TypedResponse<AcknowledgeNotificationResponse | {error: string}> | Response>;
    dismissNotification(ctx: Context): Promise<TypedResponse<DismissNotificationResponse | {error: string}> | Response>;
    bulkCreateNotifications(ctx: Context): Promise<TypedResponse<BulkCreateNotificationsResponse> | Response>;
    deleteNotification(ctx: Context): Promise<TypedResponse<DeleteNotificationResponse | {error: string}> | Response>;
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
            const mapped = notifications.map((notification: any) => ({
                id: notification.id,
                userId: typeof notification.user === "string" ? notification.user : notification.user?.id ?? notification.userId,
                femaDisasterId: typeof notification.femaDisaster === "string" ? notification.femaDisaster : notification.femaDisaster?.id ?? notification.femaDisasterId,
                notificationType: notification.notificationType,
                notificationStatus: notification.notificationStatus,
                firstSentAt: notification.firstSentAt
                    ? (typeof notification.firstSentAt === "string"
                        ? new Date(notification.firstSentAt)
                        : notification.firstSentAt)
                    : undefined,
                lastSentAt: notification.lastSentAt
                    ? (typeof notification.lastSentAt === "string"
                        ? new Date(notification.lastSentAt)
                        : notification.lastSentAt)
                    : undefined,
                acknowledgedAt: notification.acknowledgedAt
                    ? (typeof notification.acknowledgedAt === "string"
                        ? new Date(notification.acknowledgedAt)
                        : notification.acknowledgedAt)
                    : undefined,
            }));

        // Validate mapped array
        // const validated = GetUsersDisasterNotificationsResponseSchema.parse(mapped);

        return ctx.json(mapped, 200);
    }
    );

    acknowledgeNotification = withControllerErrorHandling(
        async (ctx: Context): Promise<Response> => {
            const notificationId = ctx.req.param("id");
            if (!validate(notificationId)) {
                return ctx.json({ error: "Invalid notification ID format" }, 400);
            }
            const notification = await this.notificationService.acknowledgeNotification(notificationId);

            // Map to DisasterNotificationType shape if needed
            const mapped = {
                id: notification.id,
                userId: notification.userId,
                femaDisasterId: notification.femaDisasterId,
                notificationType: notification.notificationType,
                notificationStatus: notification.notificationStatus,
                firstSentAt: notification.firstSentAt
                    ? (typeof notification.firstSentAt === "string"
                        ? new Date(notification.firstSentAt)
                        : notification.firstSentAt)
                    : undefined,
                lastSentAt: notification.lastSentAt
                    ? (typeof notification.lastSentAt === "string"
                        ? new Date(notification.lastSentAt)
                        : notification.lastSentAt)
                    : undefined,
                acknowledgedAt: notification.acknowledgedAt
                    ? (typeof notification.acknowledgedAt === "string"
                        ? new Date(notification.acknowledgedAt)
                        : notification.acknowledgedAt)
                    : undefined,
            };

            // const validated = DisasterNotification.parse(mapped);

            return ctx.json(mapped, 200);
        }
    );

    dismissNotification = withControllerErrorHandling(
        async (ctx: Context): Promise<Response> => {
            const notificationId = ctx.req.param("id");
            if (!validate(notificationId)) {
                return ctx.json({ error: "Invalid notification ID format" }, 400);
            }
            const notification = await this.notificationService.dismissNotification(notificationId);

            // Map to DisasterNotificationType shape if needed
            const mapped = {
                id: notification.id,
                userId: notification.userId,
                femaDisasterId: notification.femaDisasterId,
                notificationType: notification.notificationType,
                notificationStatus: notification.notificationStatus,
                firstSentAt: notification.firstSentAt,
                lastSentAt: notification.lastSentAt,
                acknowledgedAt: notification.acknowledgedAt,
            };

            const validated = DisasterNotification.parse(mapped);

            return ctx.json(validated, 200);
        }
    );

    bulkCreateNotifications = withControllerErrorHandling(
        async (ctx: Context): Promise<Response> => {
            const json = await ctx.req.json();
            const payload = BulkCreateNotificationsRequestSchema.parse(json);
            const convertedPayload = payload.map(item => ({
                ...item,
                notificationType: NotificationType[item.notificationType.toUpperCase() as keyof typeof NotificationType]
            }));

            const created = await this.notificationService.bulkCreateNotifications(convertedPayload);

            // Map entities to DTOs
            const mapped = created.map((notification: any) => ({
                id: notification.id,
                userId: typeof notification.user === "string" ? notification.user : notification.user?.id ?? notification.userId,
                femaDisasterId: typeof notification.femaDisaster === "string" ? notification.femaDisaster : notification.femaDisaster?.id ?? notification.femaDisasterId,
                notificationType: notification.notificationType,
                notificationStatus: notification.notificationStatus,
                firstSentAt: notification.firstSentAt,
                lastSentAt: notification.lastSentAt,
                acknowledgedAt: notification.acknowledgedAt,
            }));

            // Validate mapped array
            const validated = BulkCreateNotificationsResponseSchema.parse(mapped);

            return ctx.json(validated, 201);
        }
    );

    deleteNotification = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<DeleteNotificationResponse | {error: string}>> => {
            const notificationId = ctx.req.param("id");
            if (!validate(notificationId)) {
                return ctx.json({ error: "Invalid notification ID format" }, 400);
            }
            const success = await this.notificationService.deleteNotification(notificationId);
            return ctx.json({ success, deletedId: notificationId }, success ? 200 : 404);
        }
    );
}