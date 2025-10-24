import { SendMessageCommand, SQSClient, SendMessageBatchCommand, SendMessageBatchRequestEntry } from "@aws-sdk/client-sqs";
import { DisasterEmailMessage } from "../../types/DisasterNotification";
import { logMessageToFile } from "../../utilities/logger";

export interface ISQSService {
    sendMessage(message: DisasterEmailMessage): Promise<void>;
    sendBatchMessages(messages: DisasterEmailMessage[]): Promise<void>;
}

export class SQSService {
    private client: SQSClient;
    private SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

    constructor() {
        this.client = new SQSClient({});
    }

    async sendMessage(message: DisasterEmailMessage): Promise<void> {
        const command = new SendMessageCommand({
        QueueUrl: this.SQS_QUEUE_URL,
        MessageBody: JSON.stringify(message),
        });

        await this.client.send(command);
    }

    async sendBatchMessages(messages: DisasterEmailMessage[]): Promise<void> {
        if (messages.length === 0) {
            return;
        }

        // AWS SQS batch limit is 10 messages per request
        const BATCH_SIZE = 10;
        
        for (let i = 0; i < messages.length; i += BATCH_SIZE) {
            const batch = messages.slice(i, i + BATCH_SIZE);
            
            const entries: SendMessageBatchRequestEntry[] = batch.map((message, index) => ({
                Id: `${i + index}`, // Unique ID for each message in the batch
                MessageBody: JSON.stringify(message),
                MessageAttributes: {
                    'email': {
                        DataType: 'String',
                        StringValue: message.to
                    },
                    'notificationId': {
                        DataType: 'String',
                        StringValue: message.notificationId
                    },
                    'disasterId': {
                        DataType: 'String',
                        StringValue: message.disasterId
                    }
                }
            }));

            const command = new SendMessageBatchCommand({
                QueueUrl: this.SQS_QUEUE_URL,
                Entries: entries
            });

            try {
                const response = await this.client.send(command);
                
                // Log successful and failed messages
                if (response.Successful && response.Successful.length > 0) {
                    logMessageToFile(`Successfully sent ${response.Successful.length} messages`);
                }
                
                if (response.Failed && response.Failed.length > 0) {
                    logMessageToFile(`Failed to send ${response.Failed.length} messages: ${response.Failed}`);
                }
            } catch (error) {
                console.error('Error sending batch messages:', error);
                throw error;
            }
        }
    }
}
