import { SQSEvent, SQSRecord, Context, SQSBatchResponse, SQSBatchItemFailure } from 'aws-lambda';
import { SESEmailService } from './ses-client';
import { DisasterEmailMessage } from '.types/DisasterNotification';

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