import { DisasterNotification } from "../../entities/DisasterNotification";
import { IDisasterNotificationTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { GetUsersDisasterNotificationsDTO } from "../../types/DisasterNotification";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { ILocationAddressTransaction } from "../location-address/transaction";
import { NotificationStatus, NotificationType } from "../../types/NotificationEnums";
import { LocationAddress } from "../../entities/LocationAddress";
import { logMessageToFile } from "../../utilities/logger";
import { IPreferenceTransaction } from "../preferences/transaction";

export interface IDisasterNotificationService {
    getUserNotifications(payload: GetUsersDisasterNotificationsDTO): Promise<DisasterNotification[]>;
    acknowledgeNotification(notificationId: string): Promise<DisasterNotification>;
    dismissNotification(notificationId: string): Promise<DisasterNotification>;
    bulkCreateNotifications(notifications: Partial<DisasterNotification>[]): Promise<DisasterNotification[]>;
    deleteNotification(notificationId: string): Promise<boolean>;
    processNewDisasters(newDisasters: FemaDisaster[]): Promise<boolean>;
}

export class DisasterNotificationService implements IDisasterNotificationService {
    private notificationTransaction: IDisasterNotificationTransaction;
    private locationTransaction: ILocationAddressTransaction;
    private userPreferences: IPreferenceTransaction;

    constructor(
        notificationTransaction: IDisasterNotificationTransaction,
        locationTransaction: ILocationAddressTransaction,
        userPreferences: IPreferenceTransaction
    ) {
        this.notificationTransaction = notificationTransaction;
        this.locationTransaction = locationTransaction;
        this.userPreferences = userPreferences;
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

    createNotificationMessage(disaster: FemaDisaster, location: LocationAddress) {
        return (
            `A disaster has been declared in your area: ${disaster}. ` +
            `Location: ${location.city}, ${location.stateProvince}. ` +
            `Declaration Date: ${disaster.declarationDate?.toLocaleDateString()}`
        );
    }

    processNewDisasters = withServiceErrorHandling(async (newDisasters: FemaDisaster[]): Promise<boolean> => {
        try {
            const notificationsToCreate: Partial<DisasterNotification>[] = [];

            // Get user-disaster pairs directly
            const userDisasterPairs = await this.locationTransaction.getUsersAffectedByDisasters(newDisasters);

            logMessageToFile(
                `Found ${userDisasterPairs.length} user-disaster combinations to create notifications for`
            );

            for (const { user, disaster } of userDisasterPairs) {
                const preferences = await this.userPreferences.getOrCreateUserPreferences(user.id);
                // Check web notification preferences
                if (preferences?.webNotificationsEnabled) {
                    notificationsToCreate.push({
                        userId: user.id,
                        femaDisasterId: disaster.id,
                        notificationType: NotificationType.WEB,
                        notificationStatus: NotificationStatus.UNREAD,
                        user: user,
                        femaDisaster: disaster,
                    });
                }

                // Check email notification preferences
                if (preferences?.emailEnabled) {
                    notificationsToCreate.push({
                        userId: user.id,
                        femaDisasterId: disaster.id,
                        notificationType: NotificationType.EMAIL,
                        notificationStatus: NotificationStatus.UNREAD,
                        user: user,
                        femaDisaster: disaster,
                    });
                }
            }

            // Bulk create all notifications
            if (notificationsToCreate.length > 0) {
                logMessageToFile(`Creating ${notificationsToCreate.length} notifications`);
                await this.bulkCreateNotifications(notificationsToCreate);
                logMessageToFile("Successfully created all notifications");
            } else {
                logMessageToFile("No users affected by new disasters");
            }

            return true;
        } catch (error) {
            logMessageToFile(`Error processing new disasters: ${error}`);
            return false;
        }
    });
}
