import { describe, test, expect, beforeEach, beforeAll, mock, afterEach } from "bun:test";
import { SQSService } from "../../modules/sqs/service";
import { DisasterNotificationService } from "../../modules/disasterNotifications/service";
import { DisasterNotificationTransaction } from "../../modules/disasterNotifications/transaction";
import { LocationAddressTransactions } from "../../modules/location-address/transaction";
import { PreferenceTransaction } from "../../modules/preferences/transaction";
import { DataSource } from "typeorm";
import { createTestData, TestDataSetup } from "../disasterNotifications/setup";
import { IBackup } from "pg-mem";
import { startTestApp } from "../setup-tests";
import { FemaDisaster } from "../../entities/FemaDisaster";
import { IQuickbooksService } from "../../modules/quickbooks/service";
import { createTestQuickbooksService } from "./create-qb-service";

describe("Email Notification Integration Test", () => {
    let backup: IBackup;
    let dataSource: DataSource;
    let testData: TestDataSetup;
    let sqsService: SQSService;
    let disasterNotificationService: DisasterNotificationService;
    let mockSend: ReturnType<typeof mock>;
    let service: IQuickbooksService;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;

        // Initialize services
        sqsService = new SQSService();

        const disasterNotificationTransaction = new DisasterNotificationTransaction(dataSource);
        const locationTransaction = new LocationAddressTransactions(dataSource);
        const userPreferencesTransaction = new PreferenceTransaction(dataSource);

        disasterNotificationService = new DisasterNotificationService(
            disasterNotificationTransaction,
            locationTransaction,
            userPreferencesTransaction,
            sqsService
        );

        service = createTestQuickbooksService(dataSource);
    });

    beforeEach(async () => {
        backup.restore();

        // Mock the SQS send method
        mockSend = mock(() =>
            Promise.resolve({
                Successful: ["1"],
                Failed: [],
            })
        );

        sqsService["client"].send = mockSend;

        testData = await createTestData(dataSource, true); // true = include notifications
    });

    afterEach(() => {
        mockSend.mockClear();
    });

    test("Full flow: fetch disasters -> create notifications -> send SQS messages", async () => {
        // Start testing at point after fetch real FEMA disasters from yesterday

        const newDisasters: FemaDisaster[] = [];
        newDisasters.push(testData.disasters.disaster1);
        newDisasters.push(testData.disasters.disaster2);

        // Process disasters (this triggers the whole flow)
        const result = await disasterNotificationService.processNewDisasters(newDisasters, service);

        // erify the flow worked
        expect(result).toBe(true);

        // Verify SQS was called (if user's location matches any disaster)
        if (mockSend.mock.calls.length > 0) {
            // Verify the message structure
            const command = mockSend.mock.calls[0][0];
            expect(command.input.QueueUrl).toBeDefined();
            expect(command.input.Entries).toBeDefined();
            expect(command.input.Entries.length).toBeGreaterThan(0);

            // Verify message body has correct structure
            const firstMessage = JSON.parse(command.input.Entries[0].MessageBody);
            expect(firstMessage.to).toBe("example@test.com");
            expect(firstMessage.from).toBe("priseregenerate@gmail.com");
            expect(firstMessage.firstName).toBe("Jane");
            expect(firstMessage.disasterId).toBeDefined();
            expect(firstMessage.notificationId).toBeDefined();
        }
    });
});
