"use client";
import Progress from "@/components/progress";
import Company from "./company";
import Insurance from "./insurance";
import UserInfoPage from "./user";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Quickbooks from "./quickbooks";
import InfoPage from "./infoPage";
import Image from "next/image";

interface OnboardingProps {
    email: string;
}

export default function Onboarding({ email }: OnboardingProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stage = parseInt(searchParams.get("stage") || "0");
    const [progress, setProgress] = useState(getStep(stage));

    const incrementProgress = () => {
        setProgress((prev) => prev + 1);
    };

    const infoSteps = [0, 2, 4, 7];

    function getStep(stage: number): number {
        switch (stage) {
            case 0:
                return 0;
            case 1:
                return 2;
            default:
                return 6;
        }
    }

    const components = [
        <InfoPage
            key={0}
            handleNext={incrementProgress}
            title={"First we'll need some basic\ninformation to set up your account."}
            description="This information will help set up your profile."
        />,
        <UserInfoPage key={1} email={email} handleNext={incrementProgress} />,
        <InfoPage
            key={2}
            handleNext={incrementProgress}
            title={"Tell us about your business."}
            description="Your business name, owner, business type, and business location(s) help allow 
                            Prisere to personalize your experience. If you file a claim report, 
                            it will allow us to autofill fields for a smooth filing process."
            image={
                <Image
                    src="/BusinessInfoOnboarding.png"
                    alt="Business Location Editors"
                    className="max-w-none"
                    width={640}
                    height={265}
                />
            }
        />,
        <Company key={3} handleNext={incrementProgress} />,
        <InfoPage
            key={4}
            handleNext={incrementProgress}
            handleSkip={() => setProgress((prev) => prev + 2)}
            title={"Enter insurance information."}
            description="This is an optional step but will be helpful if you choose to file a claim report."
            optional={true}
        />,
        <Insurance key={5} handleNext={incrementProgress} />,
        <Quickbooks key={6} handleNext={incrementProgress} />,
        <InfoPage
            key={7}
            handleNext={() => router.push("/")}
            title={"You're all set!"}
            description="You can now start using Prisere."
            buttonText="Go to Dashboard"
        />,
    ];

    const onboardingList = [
        { label: "Profile", step: 1 },
        { label: "Business", step: 3 },
        { label: "Insurance", step: 5 },
        { label: "Connect Data", step: 6 },
    ];

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {progress < components.length && !infoSteps.includes(progress) && (
                <div className="">
                    <Progress items={onboardingList} progress={progress} />
                </div>
            )}
            <div className="min-w-[50%] h-[706px] max-h-[706px] space-y-8 ">{components[progress]}</div>
        </div>
    );
}
