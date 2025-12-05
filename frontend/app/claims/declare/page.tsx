"use client";

import { getCompany, getCompanyLocations } from "@/api/company";
import { getUser } from "@/api/user";
import Progress from "@/components/progress";
import { Button } from "@/components/ui/button";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Suspense } from "react";
import BusinessInfoStep from "./BusinessInfoStep";
import { SaveStatusIndicator } from "./components/SaveStatusIndicator";
import DisasterInfoStep from "./DisasterInfoStep";
import ExportStep from "./ExportStep";
import { useClaimProgress } from "./hooks/useClaimProgress";
import IncidentDateStep from "./IncidentDateStep";
import InsuranceInfoStep from "./InsuranceInfoStep";
import PersonalInfoStep from "./PersonalInfoStep";
import StartStep from "./StartStep";
import { Card } from "@/components/ui/card";

/**
 * The steps that are displayed in the progress bar
 */
const progressSteps = [
    { label: "Disaster Information", step: 0 },
    { label: "Personal Information", step: 1 },
    { label: "Business Information", step: 2 },
    { label: "Insurance Information", step: 3 },
    { label: "Export Report", step: 4 },
] satisfies { label: string; step: ClaimStepNumber }[];

function DeclareDisasterContent() {
    const router = useRouter();
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
    const initialDisasterInfo: DisasterInfo = {
        name: "",
        startDate: null,
        endDate: null,
        location: "",
        description: "",
        additionalDocuments: [],
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
        businessType: businessInfoData?.companyType || "LLC",
    } satisfies BusinessInfo;

    const initialInsurerInfo = {
        id: "",
    } satisfies InsurerInfo;

    // Use the claim progress hook
    const {
        claimId,
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

    const queryClient = useQueryClient();

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
            router.push("/claims");
        } else {
            setStep(incrementStep(step));
        }
    };

    const handleStepBack = () => {
        setStep(decrementStep(step));
    };

    const handleSaveAndClose = async () => {
        try {
            queryClient.invalidateQueries({ queryKey: ["claim-in-progress"] });
            // Save current step's data based on which step we're on
            if (step === 0) {
                // Disaster info step - commit disaster step (creates claim if needed)
                await commitDisasterStep();
            } else if (step === 1 && claimId) {
                // Personal info step
                await commitPersonalStep();
            } else if (step === 2 && claimId) {
                // Business info step
                await commitBusinessStep();
            } else if (step === 3 && claimId) {
                // Insurance info step
                await commitInsurerStep();
            }
            // Step 4 (Export) doesn't need saving as it's already saved
            // Step -1 and -2 don't have data to save yet

            // Redirect to claims page
            router.push("/claims");
        } catch (error) {
            console.error("Error saving and closing:", error);
            // Still redirect even if there's an error
            router.push("/claims");
        }
    };

    const steps = [
        {
            step: -2,
            render: <StartStep handleStepForward={() => setStep(-1)} />,
        },
        {
            step: -1,
            render: (
                <div className="flex items-center justify-center flex-1">
                    <Card className="w-fit p-32">
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
                    </Card>
                </div>
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
                />
            ),
        },
        {
            step: 3,
            render: (
                <InsuranceInfoStep
                    insurerInfo={insurerInfo}
                    setInsurerInfo={setInsurerInfo}
                    handleStepForward={(info) => handleStepForward(3, { insurerInfo: info })}
                    handleStepBack={handleStepBack}
                />
            ),
        },
        {
            step: 4,
            render: <ExportStep claimId={claimId} handleStepForward={() => handleStepForward(4, null)} />,
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
                        <Button
                            className="text-sm bg-light-fuchsia text-fuchsia hover:bg-fuchsia hover:text-white w-fit py-2 px-3 ml-auto"
                            size="lg"
                            onClick={handleSaveAndClose}
                            disabled={saveStatus === "saving"}
                        >
                            Save and Close
                            <CheckIcon className="size-5" />
                        </Button>
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
