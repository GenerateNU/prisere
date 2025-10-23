import { describe, test, expect, beforeEach, beforeAll, mock, afterEach } from 'bun:test';
import { SQSService } from '../../../modules/sqs/service';
import { DisasterNotificationService } from '../../../modules/disasterNotifications/service';
import { DisasterNotificationTransaction } from '../../../modules/disasterNotifications/transaction';
import { LocationAddressTransactions } from '../../../modules/location-address/transaction';
import { PreferenceTransaction } from '../../../modules/preferences/transaction';
import { FemaService } from '../../../modules/clients/fema-client/service';
import { DataSource } from 'typeorm';
import { Hono } from 'hono';
import { createTestData, TestDataSetup } from "../../disasterNotifications/setup";
import { IBackup } from 'pg-mem';
import { startTestApp } from '../../setup-tests';
import { User } from '../../../entities/User';
import { LocationAddress } from '../../../entities/LocationAddress';
import { UserPreferences } from '../../../entities/UserPreferences';
import { randomUUID } from 'crypto';
import { FemaDisaster } from '../../../entities/FemaDisaster';

describe('Email Notification Integration Test', () => {
    let app: Hono;
    let backup: IBackup;
    let dataSource: DataSource;
    let testData: TestDataSetup;
    let femaService: FemaService;
    let sqsService: SQSService;
    let disasterNotificationService: DisasterNotificationService;
    let mockSend: ReturnType<typeof mock>;

    beforeAll(async () => {
        const testAppData = await startTestApp();
        app = testAppData.app;
        backup = testAppData.backup;
        dataSource = testAppData.dataSource;

        // Initialize services
        femaService = new FemaService(dataSource);
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
    });

    beforeEach(async () => {
        backup.restore();

        // Mock the SQS send method
        mockSend = mock(() => Promise.resolve({
            Successful: [],
            Failed: []
        }));

        sqsService['client'].send = mockSend;

        testData = await createTestData(dataSource, true); // true = include notifications
    });

    afterEach(() => {
        mockSend.mockClear();
    });

    test('Full flow: fetch disasters -> create notifications -> send SQS messages', async () => {
        // 1. Create test user with email preferences enabled

        // // 2. Create location address for the user


        // // 3. Enable email notifications for user


        // // 4. Fetch real FEMA disasters from yesterday
        

        let newDisasters: FemaDisaster[] = [];
        newDisasters.push(testData.disasters.disaster1)
        newDisasters.push(testData.disasters.disaster2)
        

        // 5. Process disasters (this triggers the whole flow)
        const result = await disasterNotificationService.processNewDisasters(newDisasters);

        // 6. Verify the flow worked
        // expect(result).toBe(true);
        console.log(result)

        // 7. Verify SQS was called (if user's location matches any disaster)
        // TO DO: Match to how much should be called based off of notifs to send
        if (mockSend.mock.calls.length > 0) {
            console.log(`SQS called ${mockSend.mock.calls.length} times`);
            
            // Verify the message structure
            const command = mockSend.mock.calls[0][0];
            // expect(command.input.QueueUrl).toBeDefined();
            // expect(command.input.Entries).toBeDefined();
            // expect(command.input.Entries.length).toBeGreaterThan(0);

            // Verify message body has correct structure
            const firstMessage = JSON.parse(command.input.Entries[0].MessageBody);
            // expect(firstMessage.to).toBe('test@example.com');
            // expect(firstMessage.from).toBe('priseregenerate@gmail.com');
            // expect(firstMessage.firstName).toBe('Test');
            // expect(firstMessage.disasterId).toBeDefined();
            // expect(firstMessage.notificationId).toBeDefined();
        } else {
            //  TO DO: compare to the number new/to be sent
            console.log('No SQS messages sent');
        }
    });

    
});