"use client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { BannerData } from "@/types/user";
import Link from "next/link";
import { FileText, ClipboardCheck, Building, FileBarChart, AlertCircle } from "lucide-react";

const FEMA_DAMAGE_ASSESMENT_URL = "https://www.fema.gov/disaster/how-declared/preliminary-damage-assessments/guide";
const FEMA_RISK_ASSESMENT_URL =
    "https://www.fema.gov/emergency-managers/national-preparedness/goal/risk-capability-assessment";
const FEMA_ASSISTANCE_URL = "https://www.fema.gov/assistance/individual/small-business";
type Props = {
    bannerData: BannerData;
};

// Define individual step components
const NextStepItem = ({
    icon: Icon,
    title,
    link,
    linkText,
}: {
    icon: React.ElementType;
    title: string;
    link: string;
    linkText: string;
}) => (
    <li className="rounded-lg border p-4 transition-colors">
        <div className="flex items-start gap-3 flex-col">
            <div className="w-10 h-10 rounded-full bg-pink flex items-center justify-center">
                <Icon className="w-5 h-5 text-fuchsia" strokeWidth={1.25} />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium mb-1">{title}</p>
                <Link href={link} className="text-sm font-semibold underline hover:no-underline">
                    {linkText}
                </Link>
            </div>
        </div>
    </li>
);

// Define all possible steps as reusable objects
const STEPS = {
    expenseTracker: {
        icon: FileBarChart,
        title: "Make sure your expense files are up to date",
        link: "/expense-tracker",
        linkText: "Review the Expense Tracker",
    },
    damageDocumentation: {
        icon: FileText,
        title: "Look at FEMA's Guide on Damage Documentation Requirements",
        link: FEMA_DAMAGE_ASSESMENT_URL,
        linkText: "Review FEMA's Damage Documentation Guide",
    },
    femaQualification: {
        icon: ClipboardCheck,
        title: "Check if your business qualifies for FEMA disaster assistance",
        link: FEMA_ASSISTANCE_URL,
        linkText: "Review FEMA's Qualification Requirements",
    },
    riskAssessments: {
        icon: AlertCircle,
        title: "Stay up to date with FEMA Risk Assessments",
        link: FEMA_RISK_ASSESMENT_URL,
        linkText: "Review FEMA's National Risk Map",
    },
    businessProfile: {
        icon: Building,
        title: "Ensure business profile is up to date",
        link: "/business-profile",
        linkText: "Go to Business Profile",
    },
};

export default function NextSteps({ bannerData }: Props) {
    // Build steps array based on status
    let steps: (typeof STEPS)[keyof typeof STEPS][] = [];
    let headerText = "";

    if (bannerData.status === "no-disaster") {
        headerText = "Welcome back to Prisere! Below are some actionable items:";
        steps = [STEPS.expenseTracker, STEPS.riskAssessments, STEPS.businessProfile];
    } else if (bannerData.status === "no-claim") {
        headerText = "A FEMA disaster is affecting your business, below are other resources that may help:";
        steps = [STEPS.femaQualification, STEPS.damageDocumentation, STEPS.expenseTracker];
    } else if (bannerData.status === "has-claim") {
        headerText = "A disaster is affecting your business, below are other resources that may help:";
        steps = [STEPS.expenseTracker, STEPS.damageDocumentation];
    }

    return (
        <Card className="h-full min-h-[371px] p-6 border-none flex flex-col shadow-none">
            <CardTitle className="text-2xl font-bold">Next Steps</CardTitle>

            <p className="text-sm text-charcoal">{headerText}</p>

            <CardContent className="p-0 flex-1 overflow-auto">
                <ul className="flex flex-col gap-4">
                    {steps.map((step, index) => (
                        <NextStepItem key={index} {...step} />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
