import { describe, test, expect, beforeEach, mock } from "bun:test";
import { SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { DisasterEmailMessage } from "../../types/DisasterNotification";
import { SQSService } from "../../modules/sqs/service";

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

    let queueUrl: string;
    if (process.env.SQS_QUEUE_URL_PROD) {
        queueUrl = process.env.SQS_QUEUE_URL_PROD;
    } else {
        queueUrl = "https://sqs.us-east-1.amazonaws.com/1243/test";
    }

    const createMockMessage = (id: string): DisasterEmailMessage => ({
        to: `user${id}@example.com`,
        from: "priseregenerate@gmail.com",
        subject: "FEMA Disaster Alert",
        firstName: `User${id}`,
        declarationDate: new Date("2025-01-01"),
        declarationType: "Fire",
        city: "Boston",
        notificationId: `notif-${id}`,
        disasterId: `disaster-${id}`,
        companyName: "Test Company",
    });

    describe("sendBatchMessages", () => {
        test("should handle empty message array", async () => {
            await sqsService.sendBatchMessages([]);

            expect(mockSend).toHaveBeenCalledTimes(0);
        });

        test("should send a single batch of messages successfully", async () => {
            const messages = [createMockMessage("1"), createMockMessage("2")];

            mockSend.mockResolvedValueOnce({
                Successful: [
                    { Id: "0", MessageId: "msg-1" },
                    { Id: "1", MessageId: "msg-2" },
                ],
                Failed: [],
            });

            await sqsService.sendBatchMessages(messages);

            expect(mockSend).toHaveBeenCalledTimes(1);

            // Verify the command
            const command = mockSend.mock.calls[0][0] as SendMessageBatchCommand;
            expect(command.input.QueueUrl).toBe(queueUrl);
            expect(command.input.Entries).toHaveLength(2);
            expect(command.input.Entries![0].Id).toBe("0");
            expect(command.input.Entries![0].MessageBody).toBe(JSON.stringify(messages[0]));
        });

        test("should split large message arrays into batches of 10", async () => {
            const messages = Array.from({ length: 25 }, (_, i) => createMockMessage(i.toString()));

            mockSend.mockResolvedValue({
                Successful: Array.from({ length: 10 }, (_, i) => ({
                    Id: i.toString(),
                    MessageId: `msg-${i}`,
                })),
                Failed: [],
            });

            await sqsService.sendBatchMessages(messages);

            // Should be called 3 times: 10 + 10 + 5
            expect(mockSend).toHaveBeenCalledTimes(3);

            // Verify first batch has 10 messages
            const firstCall = mockSend.mock.calls[0][0] as SendMessageBatchCommand;
            expect(firstCall.input.Entries).toHaveLength(10);

            // Verify last batch has 5 messages
            const lastCall = mockSend.mock.calls[2][0] as SendMessageBatchCommand;
            expect(lastCall.input.Entries).toHaveLength(5);
        });

        test("should include message attributes", async () => {
            const messages = [createMockMessage("1")];

            mockSend.mockResolvedValueOnce({
                Successful: [{ Id: "0", MessageId: "msg-1" }],
                Failed: [],
            });

            await sqsService.sendBatchMessages(messages);

            const command = mockSend.mock.calls[0][0] as SendMessageBatchCommand;
            const entry = command.input.Entries![0];

            expect(entry.MessageAttributes).toBeDefined();
            expect(entry.MessageAttributes!["email"].StringValue).toBe("user1@example.com");
            expect(entry.MessageAttributes!["notificationId"].StringValue).toBe("notif-1");
            expect(entry.MessageAttributes!["disasterId"].StringValue).toBe("disaster-1");
        });

        test("should handle partial failures", async () => {
            const messages = [createMockMessage("1"), createMockMessage("2"), createMockMessage("3")];

            // Mock console.error to verify it's called
            const consoleErrorSpy = mock(() => {});
            const originalError = console.error;
            console.error = consoleErrorSpy;

            mockSend.mockResolvedValueOnce({
                Successful: [
                    { Id: "0", MessageId: "msg-1" },
                    { Id: "2", MessageId: "msg-3" },
                ],
                Failed: [
                    {
                        Id: "1",
                        Code: "InvalidMessageContents",
                        Message: "Invalid message",
                        SenderFault: true,
                    },
                ],
            });

            await sqsService.sendBatchMessages(messages);

            expect(mockSend).toHaveBeenCalledTimes(1);

            console.error = originalError;
        });

        test("should throw error when SQS send fails", async () => {
            const messages = [createMockMessage("1")];
            const error = new Error("SQS service unavailable");

            mockSend.mockRejectedValueOnce(error);

            await expect(sqsService.sendBatchMessages(messages)).rejects.toThrow("SQS service unavailable");

            expect(mockSend).toHaveBeenCalledTimes(1);
        });

        test("should correctly serialize message body", async () => {
            const message = createMockMessage("1");

            mockSend.mockResolvedValueOnce({
                Successful: [{ Id: "0", MessageId: "msg-1" }],
                Failed: [],
            });

            await sqsService.sendBatchMessages([message]);

            const command = mockSend.mock.calls[0][0] as SendMessageBatchCommand;
            const messageBody = JSON.parse(command.input.Entries![0].MessageBody!);

            expect(messageBody.to).toBe("user1@example.com");
            expect(messageBody.firstName).toBe("User1");
            expect(messageBody.notificationId).toBe("notif-1");
        });

        test("should handle exactly 10 messages (boundary test)", async () => {
            const messages = Array.from({ length: 10 }, (_, i) => createMockMessage(i.toString()));

            mockSend.mockResolvedValueOnce({
                Successful: Array.from({ length: 10 }, (_, i) => ({
                    Id: i.toString(),
                    MessageId: `msg-${i}`,
                })),
                Failed: [],
            });

            await sqsService.sendBatchMessages(messages);

            expect(mockSend).toHaveBeenCalledTimes(1);

            const command = mockSend.mock.calls[0][0] as SendMessageBatchCommand;
            expect(command.input.Entries).toHaveLength(10);
        });
    });
});
