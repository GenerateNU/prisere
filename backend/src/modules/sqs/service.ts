import {
    SendMessageCommand,
    SQSClient,
    SendMessageBatchCommand,
    SendMessageBatchRequestEntry,
} from "@aws-sdk/client-sqs";
import { DisasterEmailMessage } from "../../types/DisasterNotification";
import { logMessageToFile } from "../../utilities/logger";
import { BATCH_SIZE, SQS_QUEUE_URL_PROD } from "../../utilities/constants";

export interface ISQSService {
    sendMessage(message: DisasterEmailMessage): Promise<void>;
    sendBatchMessages(messages: DisasterEmailMessage[]): Promise<void>;
}

export class SQSService {
    private client: SQSClient;
    private SQS_QUEUE_URL = SQS_QUEUE_URL_PROD;

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

        logMessageToFile(`Got ${messages.length} messages to SQS Batch send`);
        for (let i = 0; i < messages.length; i += BATCH_SIZE) {
            const batch = messages.slice(i, i + BATCH_SIZE);

            const entries: SendMessageBatchRequestEntry[] = batch.map((message, index) => ({
                Id: `${i + index}`, // Unique ID for each message in the batch
                MessageBody: JSON.stringify(message),
                MessageAttributes: {
                    email: {
                        DataType: "String",
                        StringValue: message.to,
                    },
                    notificationId: {
                        DataType: "String",
                        StringValue: message.notificationId,
                    },
                    disasterId: {
                        DataType: "String",
                        StringValue: message.disasterId,
                    },
                },
            }));

            logMessageToFile(`Entires: \n${entries}`);

            const command = new SendMessageBatchCommand({
                QueueUrl: this.SQS_QUEUE_URL,
                Entries: entries,
            });

            logMessageToFile(`COMMAND: \n\n\n${JSON.stringify(messages, null, 2)}\n\n\n`);

            try {
                const response = await this.client.send(command);

                logMessageToFile(`Sending batch messages response: ${JSON.stringify(response, null, 2)}`);
                logMessageToFile(`Sending batch messages response: ${response.Failed}`);
                logMessageToFile(`Sending batch messages response: ${response.Successful}`);

                // Log successful and failed messages
                if (response.Successful && response.Successful.length > 0) {
                    logMessageToFile(`Successfully sent ${response.Successful.length} messages`);

                    logMessageToFile(`Successfully sent ${response.Successful.length} messages`);
                }

                if (response.Failed && response.Failed.length > 0) {
                    logMessageToFile(`Failed to send ${response.Failed.length} messages: ${response.Failed}`);
                }
            } catch (error) {
                console.error("Error sending batch messages:", error);
                throw error;
            }
        }
    }
}
