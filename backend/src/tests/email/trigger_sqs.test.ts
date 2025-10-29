import { describe, test, expect, beforeEach, mock } from "bun:test";
import { SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { SQSService } from "../../modules/sqs/service";
import { DisasterEmailMessage } from "../../types/DisasterNotification";

describe("SQSService", () => {
    let sqsService: SQSService;
    let mockSend: ReturnType<typeof mock>;

    beforeEach(() => {
        sqsService = new SQSService();

        // Mock the send method
        mockSend = mock(() =>
            Promise.resolve({
                Successful: [],
                Failed: [],
            })
        );

        // Replace the client's send method with the mock
        sqsService["client"].send = mockSend;
    });

    const queueUrl = process.env.SQS_QUEUE_URL_PROD
        ? process.env.SQS_QUEUE_URL_PROD
        : "https://sqs.us-east-1.amazonaws.com/1234/test";

    const createMockMessage = (id: string): DisasterEmailMessage => ({
        to: `test@example.com`,
        from: "priseregenerate@gmail.com",
        subject: "FEMA Disaster Alert",
        firstName: `Abby`,
        declarationDate: new Date("2025-01-01"),
        declarationType: "Fire",
        city: "Boston",
        notificationId: `fake-uuid`,
        disasterId: id,
        companyName: "Test Company",
    });

    describe("sendBatchMessages", () => {
        test("should send a single batch of messages successfully", async () => {
            const messages = [createMockMessage("1"), createMockMessage("2")];

            await sqsService.sendBatchMessages(messages);

            expect(mockSend).toHaveBeenCalledTimes(1);

            // Verify the command
            const command = mockSend.mock.calls[0][0] as SendMessageBatchCommand;
            expect(command.input.QueueUrl).toBe(queueUrl);
            expect(command.input.Entries).toHaveLength(2);
            expect(command.input.Entries![0].Id).toBe("0");
            expect(command.input.Entries![0].MessageBody).toBe(JSON.stringify(messages[0]));
        });
    });
});
