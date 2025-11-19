/** @jsxImportSource react */

import React from "react";
import { DisasterEmailMessage } from "../../../types/DisasterNotification";
import type { TailwindConfig } from "@react-email/components";
import { Html, Body, Container, Heading, Text, Section, Hr, Img, Tailwind, render } from "@react-email/components";

interface DisasterEmailProps {
    message: DisasterEmailMessage;
}

export default function DisasterEmail({ message }: DisasterEmailProps) {
    // for some reason this gets converted to a string. Must be something with the
    // json deserialization but adding this as a sanity check
    const declarationDate = new Date(message.declarationDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Html>
            <Tailwind
                config={
                    {
                        theme: {
                            extend: {
                                fontFamily: {
                                    sans: ["PT Sans", "Arial", "sans-serif"],
                                },
                            },
                        },
                    } as TailwindConfig
                }
            >
                <Body className="flex flex-col bg-gray-100 m-0 p-0 font-sans justify-center items-center">
                    <Container className="flex flex-col bg-white max-w-xl mx-auto">
                        <Section className="bg-white relative px-10 pt-12 min-h-[110px] max-w-xl">
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                    className="block"
                                >
                                    <polygon points="0,0 75,0 65,100 0,100" fill="#8a1e41" />
                                </svg>
                            </div>
                            <Heading className="text-white font-semibold text-[clamp(1.25rem,3vw,3rem)] m-0 relative z-10">
                                FEMA Disaster Alert
                            </Heading>
                        </Section>

                        <Section className="p-10">
                            <Text className="text-base mb-6">Hello {message.firstName},</Text>

                            <Text className="text-lg mb-8">
                                A <strong>{message.declarationType}</strong> disaster has been declared in your area.
                            </Text>

                            <table className="w-full mb-10">
                                <tbody>
                                    <tr>
                                        <td className="text-gray-500 text-sm pb-3">Declaration Date</td>
                                        <td className="text-gray-700 text-sm pb-3">{declarationDate}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-500 text-sm pb-3">Incident Type</td>
                                        <td className="text-gray-700 text-sm pb-3">
                                            {Array.isArray(message.incidentTypeMeanings)
                                                ? message.incidentTypeMeanings.join(", ")
                                                : message.incidentTypeMeanings}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-500 text-sm pb-3">County</td>
                                        <td className="text-gray-700 text-sm pb-3">
                                            {message.city ?? "Not specified"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <Text className="text-[15px] leading-6 mb-8">
                                Please review this alert and take necessary precautions. For more information about this
                                disaster and available assistance, visit{" "}
                                <a href="https://fema.gov" className="font-semibold underline text-black">
                                    FEMA.gov
                                </a>
                                .
                            </Text>

                            <Text className="text-base mb-8">Stay safe,</Text>
                            <Img
                                className="w-50 h-20"
                                src="https://prisere.com/wp-content/uploads/2023/09/Prisere-logo-transparent.png"
                            />

                            <Hr className="border-gray-300 my-8" />

                            <Text className="text-xs text-gray-500">
                                You received this email because you have registered for disaster alerts in your area.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

export async function renderDisasterEmailHTML(message: DisasterEmailMessage) {
    return render(<DisasterEmail message={message} />, { pretty: true });
}

export async function renderDisasterEmailText(message: DisasterEmailMessage) {
    return render(<DisasterEmail message={message} />, { plainText: true });
}
