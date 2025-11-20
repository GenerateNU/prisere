/** @jsxImportSource react */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { DisasterEmailMessage } from "../../../types/DisasterNotification";
import { renderDisasterEmailHTML, renderDisasterEmailText } from "../emails/email-template";
export class SESEmailService {
    private client: SESClient;
    private fromEmail: string;

    constructor(region: string = "us-east-1", fromEmail: string) {
        const config: any = {
            region: process.env.AWS_REGION || region,
        };

        // Provide fake credentials in test environment
        if (process.env.NODE_ENV === "test") {
            config.credentials = {
                accessKeyId: "test-key",
                secretAccessKey: "test-secret",
            };
        }

        // this.client = new SESClient({}); <- SE THIS FOR REAL RUN - AWS will grab config from OS env vars
        this.client = new SESClient(config);
        this.fromEmail = fromEmail;
    }

    async sendDisasterEmail(message: DisasterEmailMessage): Promise<void> {
        // Render the React Email component to HTML and plain text
        const htmlBody = await renderDisasterEmailHTML(message);
        const textBody = await renderDisasterEmailText(message);

        const destination: any = {
            ToAddresses: [message.to],
        };
        if (message.alt) {
            destination.BccAddresses = [message.alt];
        }

        const command = new SendEmailCommand({
            Source: this.fromEmail,
            Destination: destination,
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
