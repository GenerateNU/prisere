import { DisasterNotification } from "../../entities/DisasterNotification";
import { IDisasterNotificationTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    DisasterEmailMessage,
    GetUsersDisasterNotificationsDTO,
    NotificationTypeFilter,
} from "../../types/DisasterNotification";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { ILocationAddressTransaction } from "../location-address/transaction";
import { NotificationStatus } from "../../types/NotificationEnums";
import { NotificationStatus } from "../../types/NotificationEnums";
import { LocationAddress } from "../../entities/LocationAddress";
import { logMessageToFile } from "../../utilities/logger";
import { IPreferenceTransaction } from "../preferences/transaction";
import { ISQSService } from "../sqs/service";
import { getDeclarationTypeMeanings, getIncidentTypeMeanings } from "../../utilities/incident_code_meanings";
import { IQuickbooksService } from "../quickbooks/service";

export interface IDisasterNotificationService {
    getUserNotifications(
        payload: GetUsersDisasterNotificationsDTO,
        type?: NotificationTypeFilter,
        page?: number,
        limit?: number,
        status?: string
    ): Promise<DisasterNotification[]>;
    markAsReadNotification(notificationId: string): Promise<DisasterNotification>;
    markUnreadNotification(notificationId: string): Promise<DisasterNotification>;
    bulkCreateNotifications(notifications: Partial<DisasterNotification>[]): Promise<DisasterNotification[]>;
    deleteNotification(notificationId: string): Promise<boolean>;
    processNewDisasters(newDisasters: FemaDisaster[], quickbooksService: IQuickbooksService): Promise<boolean>;
    markAllAsRead(userId: string): Promise<number>;
    sendEmailNotifications(): Promise<DisasterNotification[]>;
}

export class DisasterNotificationService implements IDisasterNotificationService {
    private notificationTransaction: IDisasterNotificationTransaction;
    private locationTransaction: ILocationAddressTransaction;
    private userPreferences: IPreferenceTransaction;
    private sqsService: ISQSService;

    constructor(
        notificationTransaction: IDisasterNotificationTransaction,
        locationTransaction: ILocationAddressTransaction,
        userPreferences: IPreferenceTransaction,
        sqsService: ISQSService
    ) {
        this.notificationTransaction = notificationTransaction;
        this.locationTransaction = locationTransaction;
        this.userPreferences = userPreferences;
        this.sqsService = sqsService;
    }

    getUserNotifications = withServiceErrorHandling(
        async (
            payload: GetUsersDisasterNotificationsDTO,
            type?: NotificationTypeFilter,
            page?: number,
            limit?: number,
            status?: string
        ): Promise<DisasterNotification[]> => {
            return await this.notificationTransaction.getUserNotifications(payload, type, page, limit, status);
        }
    );

    markAsReadNotification = withServiceErrorHandling(async (notificationId: string): Promise<DisasterNotification> => {
        const notification = await this.notificationTransaction.markAsReadNotification(notificationId);
        if (!notification) {
            throw Boom.notFound("Notification not found or could not be read");
        }
        return notification;
    });

    markUnreadNotification = withServiceErrorHandling(async (notificationId: string): Promise<DisasterNotification> => {
        const notification = await this.notificationTransaction.markUnreadNotification(notificationId);
        if (!notification) {
            throw Boom.notFound("Notification not found or could not be markUnreaded");
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

    processNewDisasters = withServiceErrorHandling(
        async (newDisasters: FemaDisaster[], quickbooksService: IQuickbooksService): Promise<boolean> => {
            try {
                const notificationsToCreate: Partial<DisasterNotification>[] = [];

                // Get user-disaster pairs directly
                const userDisasterPairs = await this.locationTransaction.getUsersAffectedByDisasters(newDisasters);

                logMessageToFile(
                    `Found ${userDisasterPairs.length} user-disaster combinations to create notifications for`
                );

                for (const { user, disaster, location } of userDisasterPairs) {
                    const preferences = await this.userPreferences.getOrCreateUserPreferences(user.id);
                    notificationsToCreate.push({
                        userId: user.id,
                        femaDisasterId: disaster.id,
                        locationAddressId: location.id,
                        isWeb: preferences?.webNotificationsEnabled || false,
                        isEmail: preferences?.emailEnabled || false,
                        notificationStatus: NotificationStatus.UNREAD,
                        user: user,
                        femaDisaster: disaster,
                    });
                }

                // Bulk create all notifications
                if (notificationsToCreate.length > 0) {
                    logMessageToFile(`Creating ${notificationsToCreate.length} notifications`);
                    await this.bulkCreateNotifications(notificationsToCreate);
                    logMessageToFile("Successfully created all notifications");
                } else {
                    logMessageToFile("No users affected by new disasters");
                }

                // Send the email after creating all notifications and all imports are done
                await this.sendEmailNotifications();

                // Run QuickBooks imports in parallel and wait for all to finish
                const qbImportPromises = userDisasterPairs.map(({ user }) =>
                    quickbooksService.importQuickbooksData({ userId: user.id })
                );
                await Promise.allSettled(qbImportPromises);

                return true;
            } catch (error) {
                logMessageToFile(`Error processing new disasters: ${error}`);
                return false;
            }
        }
    );

    markAllAsRead = withServiceErrorHandling(async (userId: string): Promise<number> => {
        return await this.notificationTransaction.markAllAsRead(userId);
    });

    sendEmailNotifications = withServiceErrorHandling(async (): Promise<DisasterNotification[]> => {
        const unreadNotifications = await this.notificationTransaction.getUnreadNotifications();
        logMessageToFile(`Going to send ${unreadNotifications.length} disaster notification emails.`);

        if (unreadNotifications.length === 0) {
            logMessageToFile(`There are no unread email notifications to send.`);
            return unreadNotifications;
        } else {
            logMessageToFile(`Going to send ${unreadNotifications.length} disaster notification emails.`);
        }
        const notificationMessages: DisasterEmailMessage[] = [];

        for (const notif of unreadNotifications) {
            if (!notif.user.email) {
                logMessageToFile(`Skipping notification ${notif.id} due to undefined email`);
                continue;
            }
            logMessageToFile(`About to process notification ${notif}`);
            const message: DisasterEmailMessage = {
                to: notif.user.email,
                from: "priseregenerate@gmail.com",
                subject: "FEMA Disaster Alert from Prisere",
                firstName: notif.user.firstName,
                declarationDate: notif.femaDisaster.declarationDate,
                declarationType: notif.femaDisaster.declarationType,
                declarationTypeMeaning: getDeclarationTypeMeanings(notif.femaDisaster.declarationType),
                incidentTypes: notif.femaDisaster.designatedIncidentTypes,
                incidentTypeMeanings: getIncidentTypeMeanings(notif.femaDisaster.designatedIncidentTypes),
                city: notif.locationAddress?.city,
                notificationId: notif.id,
                disasterId: notif.femaDisaster.id,
                companyName: notif.user.company?.name,
            };
            logMessageToFile(`Message to send:\n${message}`);
            notificationMessages.push(message);
        }

        await this.sqsService.sendBatchMessages(notificationMessages);

        const result = await this.notificationTransaction.markNotificationsAsSent(
            unreadNotifications.map((notification) => notification.id)
        );
        return result;
    });
}
