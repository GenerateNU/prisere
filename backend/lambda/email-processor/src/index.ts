import { SQSEvent, SQSRecord, Context, SQSBatchResponse, SQSBatchItemFailure } from 'aws-lambda';
import { SESEmailService } from './ses-client';
import { DisasterEmailMessage } from '../../../src/types/DisasterNotification';

const sesService = new SESEmailService(
  process.env.SES_REGION || 'us-east-1',
  process.env.SES_FROM_EMAIL || 'priseregenerate@gmail.com'
);

export const handler = async (event: SQSEvent, context: Context): Promise<SQSBatchResponse> => {
  console.log(`Processing ${event.Records.length} messages`);
  
  const batchItemFailures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      await processRecord(record);
      console.log(`Successfully processed message ${record.messageId}`);
    } catch (error) {
      console.error(`Failed to process message ${record.messageId}:`, error);
      
      batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  console.log(`Processed ${event.Records.length} messages. Failures: ${batchItemFailures.length}`);

  return {
    batchItemFailures,
  };
};

async function processRecord(record: SQSRecord): Promise<void> {
  const message: DisasterEmailMessage = JSON.parse(record.body);

  console.log(`Sending email to ${message.to} for disaster ${message.disasterId}`);

  if (!message.to || !message.firstName || !message.declarationType) {
    throw new Error('Missing required fields in message');
  }

  await sesService.sendDisasterEmail(message);

  console.log(`Email sent successfully to ${message.to}`);
}

// TO DO: REBUILD LAMBDA WITHOUT THIS TEST DATA - Use real SQS message
// For local testing
// if (import.meta.main) {
//   const mockEvent: SQSEvent = {
//     Records: [
//       {
//         messageId: 'test-123',
//         receiptHandle: 'test-receipt',
//         body: JSON.stringify({
//           to: 'abby.05.reese@gmail.com',
//           from: 'priseregenerate@gmail.com',
//           subject: 'FEMA Disaster Alert from Prisere',
//           firstName: 'Test User',
//           declarationDate: new Date('2025-01-15'),
//           declarationType: 'Fire',
//           city: 'Boston',
//           notificationId: 'notif-123',
//           disasterId: 'disaster-456',
//           companyName: 'Test Company',
//         } as DisasterEmailMessage),
//         attributes: {
//           ApproximateReceiveCount: '1',
//           SentTimestamp: '1234567890',
//           SenderId: 'test',
//           ApproximateFirstReceiveTimestamp: '1234567890',
//         },
//         messageAttributes: {},
//         md5OfBody: 'test',
//         eventSource: 'aws:sqs',
//         eventSourceARN: 'arn:aws:sqs:us-east-1:123456789:test',
//         awsRegion: 'us-east-1',
//       },
//     ],
//   };

//   const mockContext = {} as Context;

//   handler(mockEvent, mockContext)
//     .then((result) => {
//       console.log('Result:', result);
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// }