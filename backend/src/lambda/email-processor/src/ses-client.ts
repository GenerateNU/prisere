import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DisasterEmailMessage } from ".types/DisasterNotification";
import { buildEmailHtml, buildEmailText } from "./email-template";

export class SESEmailService {
    private client: SESClient;
    private fromEmail: string;

    constructor(region: string = "us-east-1", fromEmail: string) {
        this.client = new SESClient({ region });
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
