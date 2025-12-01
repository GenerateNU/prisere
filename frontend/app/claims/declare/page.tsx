"use client";

import { getCompany, getCompanyLocations } from "@/api/company";
import { getUser } from "@/api/user";
import Progress from "@/components/progress";
import { cn } from "@/lib/utils";
import {
    BusinessInfo,
    ClaimStepData,
    ClaimStepNumber,
    decrementStep,
    DisasterInfo,
    incrementStep,
    InsurerInfo,
    isStep,
    PersonalInfo,
} from "@/types/claim";
import { useQuery } from "@tanstack/react-query";
import React, { Suspense } from "react";
import BusinessInfoStep from "./BusinessInfoStep";
import { SaveStatusIndicator } from "./components/SaveStatusIndicator";
import DisasterInfoStep from "./DisasterInfoStep";
import ExportStep from "./ExportStep";
import { useClaimProgress } from "./hooks/useClaimProgress";
import IncidentDateStep from "./IncidentDateStep";
import InsurerInfoStep from "./InsurerInfoStep";
import PersonalInfoStep from "./PersonalInfoStep";
import StartStep from "./StartStep";

/**
 * The steps that are displayed in the progress bar
 */
const progressSteps = [
    { label: "Disaster Info", step: 0 },
    { label: "Personal Info", step: 1 },
    { label: "Business Info", step: 2 },
    { label: "Insurer Info", step: 3 },
    { label: "Export Report", step: 4 },
] satisfies { label: string; step: ClaimStepNumber }[];

function DeclareDisasterContent() {
    const { data: businessInfoData, isSuccess: businessInfoSuccess } = useQuery({
        queryKey: ["businessInfo"],
        queryFn: getCompany,
    });

    const { data: userInfoData, isSuccess: userInfoSuccess } = useQuery({
        queryKey: ["userInfo"],
        queryFn: getUser,
    });

    const { data: companyLocations } = useQuery({
        queryKey: ["companyLocations"],
        queryFn: getCompanyLocations,
    });

    // Initial form data from user/company queries
    const initialDisasterInfo = {
        name: "",
        startDate: null,
        endDate: null,
        location: "",
        description: "",
        purchaseSelections: {
            fullPurchaseIds: [],
            partialLineItemIds: [],
        },
        isFema: false,
    } satisfies DisasterInfo;

    const initialPersonalInfo = {
        firstName: userInfoData?.firstName || "",
        lastName: userInfoData?.lastName || "",
        email: userInfoData?.email || "",
        phone: userInfoData?.phoneNumber || "",
    } satisfies PersonalInfo;

    const initialBusinessInfo = {
        businessName: businessInfoData?.name || "",
        businessOwner: businessInfoData?.businessOwnerFullName || "",
        businessType: businessInfoData?.companyType || "",
    } satisfies BusinessInfo;

    const initialInsurerInfo = {
        name: "test",
    } satisfies InsurerInfo;

    // Use the claim progress hook
    const {
        step,
        saveStatus,
        disasterInfo,
        personalInfo,
        businessInfo,
        insurerInfo,
        setDisasterInfo,
        setPersonalInfo,
        setBusinessInfo,
        setInsurerInfo,
        setStep,
        commitDisasterStep,
        commitPersonalStep,
        commitBusinessStep,
        commitInsurerStep,
        finalizeClaimSubmission,
    } = useClaimProgress(initialDisasterInfo, initialPersonalInfo, initialBusinessInfo, initialInsurerInfo);

    // Update local state when queries succeed
    React.useEffect(() => {
        if (businessInfoSuccess && businessInfoData) {
            setBusinessInfo({
                businessName: businessInfoData.name,
                businessOwner: businessInfoData.businessOwnerFullName,
                businessType: businessInfoData.companyType,
            });
        }
    }, [businessInfoSuccess, businessInfoData, setBusinessInfo]);

    React.useEffect(() => {
        if (userInfoSuccess && userInfoData) {
            setPersonalInfo({
                firstName: userInfoData.firstName,
                lastName: userInfoData.lastName,
                email: userInfoData.email ?? "",
                phone: userInfoData.phoneNumber,
            });
        }
    }, [userInfoSuccess, userInfoData, setPersonalInfo]);

    const handleStepForward = async <T extends ClaimStepNumber>(step: T, validatedData: ClaimStepData<T>) => {
        // Handle claim creation and backend commits at specific steps
        if (isStep(step, -1)) {
            // Moving from incident date to disaster info
            setStep(0);
        } else if (isStep(step, 0, validatedData)) {
            // Commit disaster step - creates/updates SelfDisaster and Claim
            await commitDisasterStep(validatedData.disasterInfo);
            setStep(1);
        } else if (isStep(step, 1, validatedData)) {
            // Commit personal step
            await commitPersonalStep(validatedData.personalInfo);
            setStep(2);
        } else if (isStep(step, 2, validatedData)) {
            // Commit business step
            await commitBusinessStep(validatedData.businessInfo);
            setStep(3);
        } else if (isStep(step, 3, validatedData)) {
            // Commit insurer step
            await commitInsurerStep(validatedData.insurerInfo);
            setStep(4);
        } else if (isStep(step, 4, validatedData)) {
            // Finalize submission
            await finalizeClaimSubmission();
            setStep(5);
        } else {
            setStep(incrementStep(step));
        }
    };

    const handleStepBack = () => {
        setStep(decrementStep(step));
    };

    const steps = [
        {
            step: -2,
            render: <StartStep handleStepForward={() => setStep(-1)} />,
        },
        {
            step: -1,
            render: (
                <IncidentDateStep
                    incidentDate={disasterInfo.startDate}
                    setIncidentDate={(date: Date) => {
                        setDisasterInfo({ startDate: date });
                    }}
                    incidentEndDate={disasterInfo.endDate}
                    setIncidentEndDate={(date: Date) => setDisasterInfo({ endDate: date })}
                    handleStepForward={() => handleStepForward(-1, null)}
                    handleStepBack={handleStepBack}
                />
            ),
        },
        {
            step: 0,
            render: (
                <DisasterInfoStep
                    disasterInfo={disasterInfo}
                    setDisasterInfo={setDisasterInfo}
                    handleStepForward={(info) => handleStepForward(0, { disasterInfo: info })}
                    handleStepBack={handleStepBack}
                    locations={companyLocations}
                />
            ),
        },
        {
            step: 1,
            render: (
                <PersonalInfoStep
                    personalInfo={personalInfo}
                    setPersonalInfo={setPersonalInfo}
                    handleStepForward={(info) => handleStepForward(1, { personalInfo: info })}
                    handleStepBack={handleStepBack}
                />
            ),
        },
        {
            step: 2,
            render: (
                <BusinessInfoStep
                    businessInfo={businessInfo}
                    setBusinessInfo={setBusinessInfo}
                    handleStepForward={(info) => handleStepForward(2, { businessInfo: info })}
                    handleStepBack={handleStepBack}
                    locations={companyLocations}
                />
            ),
        },
        {
            step: 3,
            render: (
                <InsurerInfoStep
                    insurerInfo={insurerInfo}
                    setInsurerInfo={setInsurerInfo}
                    handleStepForward={(info) => handleStepForward(3, { insurerInfo: info })}
                    handleStepBack={handleStepBack}
                />
            ),
        },
        {
            step: 4,
            render: <ExportStep />,
        },
    ] satisfies { step: ClaimStepNumber; render: React.ReactNode }[];

    const currentStep = steps.find((s) => s.step === step);

    return (
        <div
            className={cn(
                `bg-slate flex flex-col px-[20%] pt-[70px] min-h-screen pb-8`,
                step === 1 && "justify-center"
            )}
        >
            {step > -1 && step !== 5 && (
                <div className="">
                    <div className="flex justify-between items-center mb-4">
                        <SaveStatusIndicator status={saveStatus} />
                    </div>
                    <Progress progress={step} items={progressSteps} />
                </div>
            )}
            {currentStep?.render}
        </div>
    );
}

export default function DeclareDisaster() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DeclareDisasterContent />
        </Suspense>
    );
}
