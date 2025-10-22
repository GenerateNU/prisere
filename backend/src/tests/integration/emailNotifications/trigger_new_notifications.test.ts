// import { describe, test, expect, beforeEach, mock, beforeAll } from 'bun:test';
// import { SendMessageBatchCommand } from '@aws-sdk/client-sqs';
// import { SQSService } from '../../../modules/sqs/service';
// import { DisasterEmailMessage } from '../../../types/DisasterNotification';
// import { FemaService } from '../../../modules/clients/fema-client/service';
// import { DataSource } from 'typeorm';
// import { Hono } from 'hono';
// import { IBackup } from 'pg-mem';
// import { startTestApp } from '../../setup-tests';
// import { da } from 'zod/v4/locales';


// describe('SQSService', () => {
//     let sqsService: SQSService;
//     let app: Hono;
//     let backup: IBackup;
//     let dataSource: DataSource;
//     // let testData: TestDataSetup;
//     // let disasterNotificationTransaction: DisasterNotificationTransaction;
//     let femaService: FemaService;

//     beforeAll(async () => {
//         const testAppData = await startTestApp()
//         app = testAppData.app;
//         backup = testAppData.backup;
//         dataSource = testAppData.dataSource;
//         femaService = new FemaService(dataSource);
//         sqsService = new SQSService();
//         // disasterNotificationTransaction = new DisasterNotificationTransaction(dataSource);
//     })

//     beforeEach(async () => {
        
//         backup.restore();
//     });

//     let queueUrl: string;
//     if (process.env.SQS_QUEUE_URL) {
//         queueUrl = process.env.SQS_QUEUE_URL;
//     } else {
//         queueUrl = 'https://sqs.us-east-1.amazonaws.com/478867930449/Prisere-jobs';
//     }

//     // const createMockMessage = (id: string): DisasterEmailMessage => ({
//     //     to: `abby.05.reese@gmail.com`,
//     //     from: 'priseregenerate@gmail.com',
//     //     subject: 'FEMA Disaster Alert',
//     //     firstName: `Abby`,
//     //     declarationDate: new Date('2025-01-01'),
//     //     declarationType: 'Fire',
//     //     city: 'Boston',
//     //     notificationId: `fake-uuid`,
//     //     disasterId: `disaster-uuid`,
//     //     companyName: 'Test Company'
//     // });

//     describe('sendBatchMessages', () => {

//         test('should send a single batch of messages successfully', async () => {
//             const lastRefreshDate = new Date();
//             lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);
//             // if (femaService) {
//                 const newDisasters = await femaService.fetchFemaDisasters({ lastRefreshDate: lastRefreshDate });
//             // }

//             console.log(`Going to process ${newDisasters.length} new FEMA Disasters.`);
//             // await this.disasterNotificationService.processNewDisasters(newDisasters);
//             // const messages = [createMockMessage('1'), createMockMessage('2')];

//             // await sqsService.sendBatchMessages(messages);

//             // expect(mockSend).toHaveBeenCalledTimes(1);
            
//             // // Verify the command
//             // const command = mockSend.mock.calls[0][0] as SendMessageBatchCommand;
//             // expect(command.input.QueueUrl).toBe(queueUrl);
//             // expect(command.input.Entries).toHaveLength(2);
//             // expect(command.input.Entries![0].Id).toBe('0');
//             // expect(command.input.Entries![0].MessageBody).toBe(JSON.stringify(messages[0]));
//         });

        
//     });
// });