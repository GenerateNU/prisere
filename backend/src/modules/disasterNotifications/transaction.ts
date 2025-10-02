import { DisasterNotification } from "../../entities/DisasterNotification";
import { DataSource, InsertResult } from "typeorm";
import Boom from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { GetUsersDisasterNotificationsDTO } from "../../types/DisasterNotification";
import { User } from "../../entities/User";
import { FemaDisaster } from "../../entities/FemaDisaster";

/**
 * Interface for disaster notification transaction operations.
 */
export interface IDisasterNotificationTransaction {
    /**
     * Get all notifications for a specific user.
     * @param payload - The payload containing user info and possible filters.
     * @returns Promise resolving to an array of DisasterNotification entities.
     */
    getUserNotifications(payload: GetUsersDisasterNotificationsDTO): Promise<DisasterNotification[]>;

    /**
     * Acknowledge a specific notification.
     * @param notificationId - The notification's unique identifier.
     * @returns Promise resolving to the updated DisasterNotification entity.
     */
    acknowledgeNotification(notificationId: string): Promise<DisasterNotification>;

    /**
     * Mark a notification as read/dismissed.
     * @param notificationId - The notification's unique identifier.
     * @returns Promise resolving to the updated DisasterNotification entity.
     */
    dismissNotification(notificationId: string): Promise<DisasterNotification>;

    /**
     * Bulk create new notifications. Takes in all new disasters and creates the notifications
     * for all the impacted companies.
     * @param notifications - Array of partial DisasterNotification objects to create.
     * @returns Promise resolving to an array of created DisasterNotification entities.
     */
    bulkCreateNotifications(notifications: Partial<DisasterNotification>[]): Promise<DisasterNotification[]>;

    /**
     * Delete a specific notification.
     * @param notificationId - The notification's unique identifier.
     * @returns Promise resolving to a boolean indicating success.
     */
    deleteNotification(notificationId: string): Promise<boolean>;
}

export class DisasterNotificationTransaction implements IDisasterNotificationTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async getUserNotifications(payload: GetUsersDisasterNotificationsDTO): Promise<DisasterNotification[]> {
        const existing = await this.db.getRepository(User).findOne({ where: { id: payload.id } });
        if (!existing) {
            logMessageToFile(`User not found: ${payload.id}`);
            throw Boom.notFound("user not found");
        }

        const result: DisasterNotification[] = await this.db
            .createQueryBuilder()
            .select("disasterNotification")
            .from(DisasterNotification, "disasterNotification")
            .where("disasterNotification.userId = :id", { id: payload.id })
            .getMany();

        if (!result || result.length === 0) {
            logMessageToFile(`No notifications found for user ID: ${payload.id}`);
            throw Boom.notFound("No notifications found for user");
        }

        return result;
    }

    async acknowledgeNotification(notificationId: string): Promise<DisasterNotification> {
        const result = await this.db
            .createQueryBuilder()
            .update(DisasterNotification)
            .set({ notificationStatus: "acknowledged", acknowledgedAt: new Date() })
            .where("id = :id", { id: notificationId })
            .returning("*")
            .execute();

        const updatedNotification = result.raw[0];
        if (!updatedNotification) {
            logMessageToFile(`Notification not found or could not update: ${notificationId}`);
            throw Boom.notFound("Notification not found or could not update status");
        }
        return updatedNotification;
    }

    async dismissNotification(notificationId: string): Promise<DisasterNotification> {
        const result = await this.db
            .createQueryBuilder()
            .update(DisasterNotification)
            .set({ notificationStatus: "read" })
            .where("id = :id", { id: notificationId })
            .returning("*")
            .execute();

        const updatedNotification = result.raw[0];
        if (!updatedNotification) {
            logMessageToFile(`Notification not found or could not update: ${notificationId}`);
            throw Boom.notFound("Notification not found or could not update status");
        }
        return updatedNotification;
    }

    async bulkCreateNotifications(notifications: Partial<DisasterNotification>[]): Promise<DisasterNotification[]> {
        const successfulInsertions = [];
        const failedInsertions = [];
        const finalResult = [];

        for (let i = 0; i < notifications.length; i++) {
            const notification = notifications[i];
            const { userId, femaDisasterId } = notification;

            // Validate UUID format
            if (!userId || typeof userId !== "string" || !validate(userId)) {
                logMessageToFile(`Invalid userId format: ${userId}`);
                throw Boom.badRequest(`Invalid UUID format for userId: ${userId}`);
            }
            if (!femaDisasterId || typeof femaDisasterId !== "string" || !validate(femaDisasterId)) {
                logMessageToFile(`Invalid femaDisasterId format: ${femaDisasterId}`);
                throw Boom.badRequest(`Invalid UUID format for femaDisasterId: ${femaDisasterId}`);
            }

            // Check existence of userId
            const userExists = await this.db.getRepository(User).findOne({ where: { id: userId } });
            if (!userExists) {
                logMessageToFile(`User not found for userId: ${userId}`);
                throw Boom.notFound(`User not found for userId: ${userId}`);
            }

            // Check existence of femaDisasterId
            const disasterExists = await this.db
                .getRepository(FemaDisaster)
                .findOne({ where: { id: femaDisasterId } });
            if (!disasterExists) {
                logMessageToFile(`FEMA Disaster not found for femaDisasterId: ${femaDisasterId}`);
                throw Boom.notFound(`FEMA Disaster not found for femaDisasterId: ${femaDisasterId}`);
            }

            try {
                const result: InsertResult = await this.db
                    .createQueryBuilder()
                    .insert()
                    .into(DisasterNotification)
                    .values(notification)
                    .returning("*")
                    .execute();
                finalResult.push(result.raw[0]);
                successfulInsertions.push(notification);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                logMessageToFile(
                    `Failed to insert notification: ${JSON.stringify(notification)}, error: ${error?.message}, stack: ${error?.stack}`
                );
                failedInsertions.push({
                    notification,
                    error: error?.message,
                    stack: error?.stack,
                });
            }
        }

        if (failedInsertions.length > 0) {
            logMessageToFile(
                `Bulk insert completed with failures. Failed: ${JSON.stringify(failedInsertions)}, Successful: ${JSON.stringify(successfulInsertions)}`
            );
            throw Boom.internal(`Failed to insert some notifications. Details: ${JSON.stringify(failedInsertions)}`);
        }
        return finalResult;
    }

    async deleteNotification(notificationId: string): Promise<boolean> {
        const existing = await this.db.getRepository(DisasterNotification).findOne({ where: { id: notificationId } });
        console.log("EXISTING: ", existing);
        if (!existing) {
            throw Boom.notFound("ERROR: Notification ID not found");
        }
        await this.db
            .createQueryBuilder()
            .delete()
            .from(DisasterNotification)
            .where("id = :id", { id: notificationId })
            .execute();

        return true;
    }
}
