import { DisasterEmailMessage } from "../../../types/DisasterNotification";
import type { TailwindConfig } from '@react-email/components';
import {
    Html,
    Body,
    Container,
    Heading,
    Text,
    Section,
    Hr,
    Img,
    Tailwind,
  } from "@react-email/components";

interface DisasterEmailProps {
    message: DisasterEmailMessage
}

export function DisasterEmail({ message }: DisasterEmailProps) {
    const declarationDate = message.declarationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  
    return (
      <Html>
        <Tailwind config={{
          theme: {
            extend: {
              fontFamily: {
                sans: ['PT Sans', 'Arial', 'sans-serif'],
              },
            },
          },
        } as TailwindConfig}>
          <Body className="flex flex-col bg-gray-100 m-0 p-0 font-sans">
          <Section className="m-0 p-0">
            <div className="bg-[#8a1e41] relative px-10 py-6 min-h-[130px]">

              <div className="absolute top-0 right-0 w-2/5 h-full overflow-hidden">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="block"
                >
                  <polygon
                    points="30,0 100,0 100,100 0,100"
                    fill="#f5f5f5"
                  />
                </svg>
              </div>
              
              <Heading 
                as="h2" 
                className="text-white text-2xl font-semibold m-0 relative z-10"
              >
                FEMA Disaster Alert
              </Heading>
            </div>
          </Section>
  
            <Container className="bg-white max-w-xl mx-auto p-10">
              <Text className="text-base mb-6">Hello {message.firstName},</Text>
  
              <Text className="text-lg mb-8">
                A <strong>{message.declarationType}</strong> disaster has been
                declared in your area.
              </Text>
  
    
              <table className="w-full mb-10">
                <tbody>
                  <tr>
                    <td className="text-gray-500 text-sm pb-3">Declaration Date</td>
                    <td className="text-gray-700 text-sm pb-3">{declarationDate}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 text-sm pb-3">Declaration Type</td>
                    <td className="text-gray-700 text-sm pb-3">
                      {message.declarationType}
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
                Please review this alert and take necessary precautions. For more
                information about this disaster and available assistance, visit{" "}
                <a
                  href="https://fema.gov"
                  className="font-semibold underline text-black"
                >
                  FEMA.gov
                </a>.
              </Text>
  
              <Text className="text-base mb-8">Stay safe,</Text>
  
              <Hr className="border-gray-300 my-8" />
  
              <Text className="text-xs text-gray-500">
                You received this email because you have registered for disaster
                alerts in your area.
              </Text>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  }
  

export default function TestDisasterEmail() {
    return (
        <DisasterEmail
            message={{
                to: "john.doe@example.com",
                from: "alerts@disaster-system.com",
                subject: "Disaster Declaration Notice",
                firstName: "John",
                declarationDate: new Date("2025-01-15T00:00:00.000Z"),
                declarationType: "Major Disaster Declaration",
                declarationTypeMeaning: "The President has declared a major disaster.",
                incidentTypes: "Flood",
                incidentTypeMeanings: ["Severe flooding", "Coastal storm surge"],
                city: "Miami",
                notificationId: "2d79f84e-17d0-4475-b4d1-a9edfa305a91",
                disasterId: "b8797ef5-44d3-4714-a440-8fa12ab0ca48",
                companyName: "Helping Hands Insurance",
            }}
        />
    );
}
