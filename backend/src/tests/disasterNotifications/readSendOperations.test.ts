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
    });
});
