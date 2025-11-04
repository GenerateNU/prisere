"use client";
import Progress from "@/components/progress";
import Company from "./company";
import Insurance from "./insurance";
import UserInfoPage from "./user";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Quickbooks from "./quickbooks";
import Success from "./success";

interface OnboardingProps {
    email: string;
}

export default function Onboarding({ email }: OnboardingProps) {
    const searchParams = useSearchParams();
    const stage = parseInt(searchParams.get("stage") || "0");
    const [progress, setProgress] = useState(stage);

    const components = [
        <UserInfoPage key={1} email={email} progress={progress} setProgress={setProgress} />,
        <Company key={2} progress={progress} setProgress={setProgress} />,
        <Insurance key={3} progress={progress} setProgress={setProgress} />,
        <Quickbooks key={4} progress={progress} setProgress={setProgress} />,
        <Success key={4} />,
    ];

    const onboardingList = ["Profile", "Business", "Insurance", "Quickbooks"];

    return (
        <div className="flex flex-col items-center w-full">
            {progress < onboardingList.length && (
                <div className="absolute top-15 ">
                    <Progress items={onboardingList} progress={progress} />
                </div>
            )}
            <div className="w-[432px] space-y-8 mt-50 mb-50">{components[progress]}</div>
        </div>
    );
}
