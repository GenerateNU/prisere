import { DisasterNotification } from "../../entities/DisasterNotification";
import { DataSource, In, InsertResult } from "typeorm";
import Boom from "@hapi/boom";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";
import { GetUsersDisasterNotificationsDTO, NotificationTypeFilter } from "../../types/DisasterNotification";
import { User } from "../../entities/User";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { NotificationStatus } from "../../types/NotificationEnums";

/**
 * Interface for disaster notification transaction operations.
 */
export interface IDisasterNotificationTransaction {
    /**
     * Get all notifications for a specific user.
     * @param payload - The payload containing user info and possible filters.
     * @returns Promise resolving to an array of DisasterNotification entities.
     */
    getUserNotifications(
        payload: GetUsersDisasterNotificationsDTO,
        type?: NotificationTypeFilter,
        page?: number,
        limit?: number,
        status?: string
    ): Promise<DisasterNotification[]>;

    /**
     * MarkRead a specific notification.
     * @param notificationId - The notification's unique identifier.
     * @returns Promise resolving to the updated DisasterNotification entity.
     */
    markAsReadNotification(notificationId: string): Promise<DisasterNotification>;

    /**
     * Mark a notification as read/markUnreaded.
     * @param notificationId - The notification's unique identifier.
     * @returns Promise resolving to the updated DisasterNotification entity.
     */
    markUnreadNotification(notificationId: string): Promise<DisasterNotification>;
    markAllAsRead(userId: string): Promise<number>;

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

    getUnreadNotifications(): Promise<DisasterNotification[]>;

    markNotificationsAsSent(notificationIds: string[]): Promise<DisasterNotification[]>;
}

export class DisasterNotificationTransaction implements IDisasterNotificationTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async getUnreadNotifications(): Promise<DisasterNotification[]> {
        const result = await this.db
            .createQueryBuilder(DisasterNotification, "notifications")
            .leftJoinAndSelect("notifications.user", "user")
            .leftJoinAndSelect("notifications.femaDisaster", "disaster")
            .leftJoinAndSelect("notifications.locationAddress", "location")
            .leftJoinAndSelect("location.company", "company")
            .where("notifications.notificationStatus = :status", { status: 'unread' })
            .andWhere("notifications.notificationType = :type", { type: 'email' })
            .getMany();

        return result;
    }

    async getUserNotifications(
        payload: GetUsersDisasterNotificationsDTO,
        type?: NotificationTypeFilter,
        page?: number,
        limit?: number,
        status?: string
    ): Promise<DisasterNotification[]> {
        const queryBuilder = this.db
            .createQueryBuilder()
            .select("notifications")
            .from(DisasterNotification, "notifications")
            .leftJoinAndSelect("notifications.femaDisaster", "disaster")
            // Join with affected location and company so we can use this info in the notification message
            .leftJoinAndSelect("notifications.locationAddress", "location")
            .leftJoinAndSelect("location.company", "company")
            .where("notifications.userId = :id", { id: payload.id })
            .orderBy("notifications.createdAt", "DESC"); // Added sorting since we will show most recent notif as banner

        if (type) {
            queryBuilder.andWhere("notifications.notificationType = :type", { type });
        }
        if (status) {
            queryBuilder.andWhere("notifications.notificationStatus = :status", { status });
        }

        if (page && limit) {
            const totalCount = await queryBuilder.getCount();
            const maxPage = Math.ceil(totalCount / limit);

            // If requesting a page beyond available data, return empty array
            if (page > maxPage && totalCount > 0) {
                console.log(
                    `Page ${page} exceeds maximum page ${maxPage} for user ${payload.id}. Returning empty results.`
                );
                logMessageToFile(
                    `Page ${page} exceeds maximum page ${maxPage} for user ${payload.id}. Returning empty results.`
                );
                return [];
            }

            queryBuilder.skip((page - 1) * limit).take(limit);
        }

        const result: DisasterNotification[] = await queryBuilder.getMany();

        if (!result) {
            const existing = await this.db.getRepository(User).findOne({
                where: { id: payload.id },
                select: ["id"], // Only select from id field
            });
            if (!existing) {
                console.log(`User ${payload.id} not found.`);
                logMessageToFile(`User ${payload.id} not found.`);
                throw Boom.notFound("User not found");
            }
            logMessageToFile(`No notifications found for user ID: ${payload.id}${type ? ` with type: ${type}` : ""}`);
            throw Boom.notFound("No notifications found for user");
        }

        return result;
    }

    async markAsReadNotification(notificationId: string): Promise<DisasterNotification> {
        const result = await this.db
            .createQueryBuilder()
            .update(DisasterNotification)
            .set({ notificationStatus: "read", readAt: new Date() })
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

    async markUnreadNotification(notificationId: string): Promise<DisasterNotification> {
        const result = await this.db
            .createQueryBuilder()
            .update(DisasterNotification)
            .set({ notificationStatus: "unread" })
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
            const disasterExists = await this.db.getRepository(FemaDisaster).findOne({ where: { id: femaDisasterId } });
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

    async markAllAsRead(userId: string): Promise<number> {
        const result = await this.db
            .createQueryBuilder()
            .update(DisasterNotification)
            .set({
                notificationStatus: NotificationStatus.READ,
                readAt: new Date(),
            })
            .where("userId = :userId", { userId })
            .andWhere("notificationStatus = :status", { status: NotificationStatus.UNREAD })
            .execute();

        return result.affected || 0;
    }

    async markNotificationsAsSent(notificationIds: string[]): Promise<DisasterNotification[]> {
    if (notificationIds.length === 0) {
        return [];
    }

    const now = new Date();

    // Update notifications that already have firstSentAt (just update lastSentAt)
    await this.db
        .createQueryBuilder()
        .update(DisasterNotification)
        .set({
            lastSentAt: now
        })
        .where("id IN (:...ids)", { ids: notificationIds })
        .andWhere("firstSentAt IS NOT NULL")
        .execute();

    // Update notifications that DON'T have firstSentAt (set both)
    await this.db
        .createQueryBuilder()
        .update(DisasterNotification)
        .set({
            firstSentAt: now,
            lastSentAt: now
        })
        .where("id IN (:...ids)", { ids: notificationIds })
        .andWhere("firstSentAt IS NULL")
        .execute();

    // Fetch and return the updated notifications
    return await this.db
        .getRepository(DisasterNotification)
        .find({
            where: { id: In(notificationIds) },
            relations: ['user', 'femaDisaster', 'locationAddress']
        });
}
}
