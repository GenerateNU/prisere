import { DisasterNotification } from "../../entities/DisasterNotification"
// import { CreateCompanyDTO, GetCompanyByIdDTO, UpdateQuickBooksImportTimeDTO } from "../../types/Company";
import { DataSource, InsertResult } from "typeorm";
import Boom from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { GetUsersDisasterNotificationsDTO } from "../../types/DisasterNotification";

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
        if (typeof payload.id !== "string") {
            throw new Error("User ID must be of type string");
        }

        try {
            const result: DisasterNotification[] = await this.db
                .createQueryBuilder()
                .select("disasterNotification")
                .from(DisasterNotification, "disasterNotification")
                .where("disasterNotification.userId = :id", { id: payload.id })
                .getMany();

            return result;
        } catch (error) {
            logMessageToFile(`Transaction error on getting users disaster notifications: ${error}`)
            if (!validate(payload.id)) {
                throw Boom.badRequest("Invlid UUID format (for user ID)")
            } else {
                throw Boom.notFound("Company Not Found")
            }
        }
    }

    async acknowledgeNotification(notificationId: string): Promise<DisasterNotification> {
        try {
            const result = await this.db
                .createQueryBuilder()
                .update(DisasterNotification)
                .set({ notificationStatus: 'acknowledged' })
                .where("id = :id", {id: notificationId })
                .returning("*")
                .execute();

            const updatedNotification = result.raw;
            if (!updatedNotification) {
                throw new Error("Could not update notification status")
            }
            return updatedNotification;
        } catch (error) {
            throw Boom.internal("Could not update")
        }
    }

    async dismissNotification(notificationId: string): Promise<DisasterNotification> {
        try {
            const result = await this.db
                .createQueryBuilder()
                .update(DisasterNotification)
                .set({ notificationStatus: 'read' })
                .where("id = :id", {id: notificationId })
                .returning("*")
                .execute();

            const updatedNotification = result.raw;
            if (!updatedNotification) {
                throw new Error("Could not update notification status")
            }
            return updatedNotification;
        } catch (error) {
            throw Boom.internal("Could not update")
        }
    }

    async bulkCreateNotifications(notifications: Partial<DisasterNotification>[]): Promise<DisasterNotification[]> {
        let successfulInsertions = []
        let failedInsertions = []
        let finalResult = []
        for (let i = 0; i < notifications.length; i++) {
            try {
                const result: InsertResult = await this.db
                .createQueryBuilder()
                .insert()
                .into(DisasterNotification)
                .values(notifications[i])
                .returning("*")
                .execute();
                finalResult.push(result.raw[0])
            } catch (error) {
                // gracefully continue with insertions, even if one fails
                failedInsertions.push(notifications[i])
            }
            successfulInsertions.push(notifications[i])
        }
        if (failedInsertions.length > 0) {
            throw Boom.internal(`Failed to insert some notifications:\n
                ${failedInsertions}\n\n
                Successful Insertions:\n
                ${successfulInsertions}`)
        }

        return finalResult;
        
    }

    async deleteNotification(notificationId: string): Promise<boolean> {
        return false;
    }
}
