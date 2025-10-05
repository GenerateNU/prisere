import { DisasterNotification } from "../../entities/DisasterNotification";
import { IDisasterNotificationTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { GetUsersDisasterNotificationsDTO } from "../../types/DisasterNotification";

export interface IDisasterNotificationService {
    getUserNotifications(payload: GetUsersDisasterNotificationsDTO): Promise<DisasterNotification[]>;
    acknowledgeNotification(notificationId: string): Promise<DisasterNotification>;
    dismissNotification(notificationId: string): Promise<DisasterNotification>;
    bulkCreateNotifications(notifications: Partial<DisasterNotification>[]): Promise<DisasterNotification[]>;
    deleteNotification(notificationId: string): Promise<boolean>;
}

export class DisasterNotificationService implements IDisasterNotificationService {
    private notificationTransaction: IDisasterNotificationTransaction;

    constructor(notificationTransaction: IDisasterNotificationTransaction) {
        this.notificationTransaction = notificationTransaction;
    }

    getUserNotifications = withServiceErrorHandling(
        async (payload: GetUsersDisasterNotificationsDTO): Promise<DisasterNotification[]> => {
            const notifications = await this.notificationTransaction.getUserNotifications(payload);
            if (!notifications || notifications.length === 0) {
                throw Boom.notFound("No notifications found for user");
            }
            return notifications;
        }
    );

    acknowledgeNotification = withServiceErrorHandling(
        async (notificationId: string): Promise<DisasterNotification> => {
            const notification = await this.notificationTransaction.acknowledgeNotification(notificationId);
            if (!notification) {
                throw Boom.notFound("Notification not found or could not be acknowledged");
            }
            return notification;
        }
    );

    dismissNotification = withServiceErrorHandling(async (notificationId: string): Promise<DisasterNotification> => {
        const notification = await this.notificationTransaction.dismissNotification(notificationId);
        if (!notification) {
            throw Boom.notFound("Notification not found or could not be dismissed");
        }
        return notification;
    });

    bulkCreateNotifications = withServiceErrorHandling(
        async (notifications: Partial<DisasterNotification>[]): Promise<DisasterNotification[]> => {
            const created = await this.notificationTransaction.bulkCreateNotifications(notifications);
            if (!created || created.length === 0) {
                throw Boom.internal("Failed to create notifications");
            }
            return created;
        }
    );

    deleteNotification = withServiceErrorHandling(async (notificationId: string): Promise<boolean> => {
        const deleted = await this.notificationTransaction.deleteNotification(notificationId);
        if (!deleted) {
            throw Boom.notFound("Notification not found or could not be deleted");
        }
        return deleted;
    });
}
