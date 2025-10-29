import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
// import { buildEmailHtml, buildEmailText } from "./email-template";
import { DisasterEmailMessage } from "../../../types/DisasterNotification";
import { buildEmailHtml, buildEmailText } from "./email-template";

export class SESEmailService {
    private client: SESClient;
    private fromEmail: string;

    constructor(region: string = "us-east-1", fromEmail: string) {
        const config: any = {
            region: process.env.AWS_REGION || "us-east-1",
        };

        // Provide fake credentials in test environment
        if (process.env.NODE_ENV === "test") {
            config.credentials = {
                accessKeyId: "test-key",
                secretAccessKey: "test-secret",
            };
        }

        this.client = new SESClient(config);
        this.fromEmail = fromEmail;
    }

    async sendDisasterEmail(message: DisasterEmailMessage): Promise<void> {
        const htmlBody = buildEmailHtml(message);
        const textBody = buildEmailText(message);

        const command = new SendEmailCommand({
            Source: this.fromEmail,
            Destination: {
                ToAddresses: [message.to],
            },
            Message: {
                Subject: {
                    Data: message.subject,
                    Charset: "UTF-8",
                },
                Body: {
                    Html: {
                        Data: htmlBody,
                        Charset: "UTF-8",
                    },
                    Text: {
                        Data: textBody,
                        Charset: "UTF-8",
                    },
                },
            },
        });

        await this.client.send(command);
    }
}
