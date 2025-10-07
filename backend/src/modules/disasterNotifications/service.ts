import { DisasterNotification } from "../../entities/DisasterNotification";
import { IDisasterNotificationTransaction } from "./transaction";
import Boom from "@hapi/boom";
import { withServiceErrorHandling } from "../../utilities/error";
import { GetUsersDisasterNotificationsDTO } from "../../types/DisasterNotification";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { DataSource } from "typeorm";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../location-address/transaction";
import { FEMALocationMatcher } from "../../utilities/fema_location_lookup";
import { LocationAddress } from "../../entities/LocationAddress";
import { NotificationStatus, NotificationType } from "../../types/NotificationEnums";

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
    private locationMatcher: FEMALocationMatcher;

    constructor(notificationTransaction: IDisasterNotificationTransaction, db: DataSource) {
        this.notificationTransaction = notificationTransaction;
        this.locationTransaction = new LocationAddressTransactions(db);
        this.locationMatcher = new FEMALocationMatcher();
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
            // Get all locations with company and user data
            const locations = await this.locationTransaction.getAllLocations();
            const notificationsToCreate: Partial<DisasterNotification>[] = [];

            for (const disaster of newDisasters) {
                console.log(`Processing disaster: ${disaster}`);

                // Get affected locations for this disaster
                const locationsResult = await this.locationMatcher.getAffectedLocations(locations, disaster);

                // Filter to only affected locations
                const affectedLocations = locationsResult.filter((result) => result.affected);
                console.log(
                    `Found ${affectedLocations.length} affected locations for disaster ${disaster.disasterNumber}`
                );

                // Create notifications for affected locations
                for (const affectedLocation of affectedLocations) {
                    // Find the full location object to get company/user info
                    const location = locations.find((loc) => loc.id === affectedLocation.id);

                    if (location?.company?.user) {
                        const { company } = location;
                        const { user } = company;

                        // Check web notification preferences
                        // if (user.webNotificationPreference || user.webNotificationPreference === undefined) {
                        notificationsToCreate.push({
                            userId: user.id,
                            femaDisasterId: disaster.id,
                            // companyId: company.id,
                            // locationId: location.id,
                            notificationType: NotificationType.WEB,
                            // message: this.createNotificationMessage(disaster, location),
                            notificationStatus: NotificationStatus.UNREAD,
                            user: user,
                            femaDisaster: new FemaDisaster(),
                        });
                        // }

                        // Check email notification preferences
                        // if (user.emailNotificationPreference || user.emailNotificationPreference === undefined) {
                        notificationsToCreate.push({
                            userId: user.id,
                            femaDisasterId: disaster.id,
                            // companyId: company.id,
                            // locationId: location.id,
                            notificationType: NotificationType.EMAIL,
                            // message: this.createNotificationMessage(disaster, location),
                            notificationStatus: NotificationStatus.UNREAD,
                            user: user,
                            femaDisaster: new FemaDisaster(),
                        });
                        // }
                    }
                }
            }

            // Bulk create all notifications after processing all disasters
            if (notificationsToCreate.length > 0) {
                console.log(`Creating ${notificationsToCreate.length} notifications`);
                await this.bulkCreateNotifications(notificationsToCreate);
                console.log("Successfully created all notifications");
            } else {
                console.log("No locations affected by new disasters");
            }

            return true;
        } catch (error) {
            console.error("Error processing new disasters:", error);
            return false;
        }
    });
}
