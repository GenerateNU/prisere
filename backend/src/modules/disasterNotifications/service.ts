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
        throw new Error("Method not implemented.");
    }

    processNewDisasters = withServiceErrorHandling(async (newDisasters: FemaDisaster[]): Promise<boolean> => {
        // get all locations
        const locations = await this.locationTransaction.getAllLocations();
        console.log(`Got all locations: ${locations}`)
        let notificationsToCreate = [];
        // match new disasters with locations
        for (const disaster of newDisasters) {
                console.log(`Processing disaster:\n ${disaster}\n\n`);
                
                // Get affected locations for this disaster
                const affectedLocations = await this.locationMatcher.getAffectedLocations(locations, disaster);
                
                // Filter to only affected locations
                const filteredAffectedLocations = affectedLocations.filter(result => result.affected);
                console.log(`Found ${affectedLocations.length} affected locations for disaster ${disaster.disasterNumber}`);

                // Create notifications for affected locations
                for (const affectedLocation of affectedLocations) {
                    // Find the full location object to get company/user info
                    const location = locations.find(loc => loc.id === affectedLocation.id);
                    if (location) {
                        notificationsToCreate.push({
                            disasterId: disaster.id,
                            companyId: location.companyId,
                            locationId: location.id,
                            // title: `${disaster} Alert - ${disaster.designatedArea}`,
                            message: this.createNotificationMessage(disaster, location),
                            status: 'unread',
                            createdAt: new Date(),
                            // add more fields?
                        });
                    }
                }

            // find all users that match impacted locations
            // create a new notification for each matching user/disaster
            // bulk create all the notifications
            // return true if successful response, false otherwise

        };
        return false;
    });

}

