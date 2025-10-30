import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "./setup";
import { startTestApp } from "../setup-tests";
import { describe, beforeAll, beforeEach, test, expect } from "bun:test";
import { DisasterNotificationTransaction } from "../../modules/disasterNotifications/transaction";

describe("Test get unread notifications (for email)", () => {
    let backup: IBackup;
    let dataSource: DataSource;
    let testData: TestDataSetup;
    let disasterNotificationTransaction: DisasterNotificationTransaction;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;
        disasterNotificationTransaction = new DisasterNotificationTransaction(dataSource);
    });

    beforeEach(async () => {
        backup.restore();
        testData = await createTestData(dataSource, true); // true = include notifications
    });

    test("GET all unread notifications for email", async () => {
        const result = await disasterNotificationTransaction.getUnreadNotifications();
        // console.log(result);
        expect(result.length).toBe(3);
    });

    test("Mark notifications as sent (for second time)", async () => {
        // get the notifications to mark as sent (from test data)
        const notifications = testData.notifications;
        const notificationArray: string[] = [];
        if (notifications?.notification1) {
            notificationArray.push(notifications?.notification1.id);
        }
        if (notifications?.notification2) {
            notificationArray.push(notifications.notification2.id);
        }

        // see the first/lastSentAt times are the same at first
        expect(notifications?.notification1.firstSentAt?.getDate === notifications?.notification1.lastSentAt?.getDate);
        expect(notifications?.notification2.firstSentAt?.getDate === notifications?.notification2.lastSentAt?.getDate);
        const result = await disasterNotificationTransaction.markNotificationsAsSent(notificationArray);
        // console.log(testData);
        // console.log(result);

        const result2 = await disasterNotificationTransaction.markNotificationsAsSent(notificationArray);
        // console.log(testData);
        // console.log(result2);

        expect(result);
        expect(result2);
        // First notification
        expect(result2[0].id);
        expect(result2[0].userId);
        expect(result2[0].firstSentAt).toBeInstanceOf(Date);
        expect(result2[0].lastSentAt).toBeInstanceOf(Date);
        expect(result2[0].readAt).toBeNull();
        expect(result2[0].createdAt).toBeInstanceOf(Date);

        // Second notification
        expect(result2[1].id);
        expect(result2[1].userId);
        expect(result2[1].firstSentAt).toBeInstanceOf(Date);
        expect(result2[1].lastSentAt).toBeInstanceOf(Date);
        expect(result2[1].readAt).toBeNull();
        expect(result2[1].createdAt).toBeInstanceOf(Date);
    });
});
