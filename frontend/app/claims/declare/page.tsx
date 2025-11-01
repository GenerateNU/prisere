"use client";

import React from "react";
import BusinessInfoStep from "./BusinessInfoStep";
import DisasterInfoStep from "./DisasterInfoStep";
import ExportStep from "./ExportStep";
import InsurerInfoStep from "./InsurerInfoStep";
import PersonalInfoStep from "./PersonalInfoStep";
import StartStep from "./StartStep";
import IncidentDateStep from "./IncidentDateStep";
import { getCompany, getCompanyLocations } from "@/api/company";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createSelfDisaster } from "@/api/self-disaster";
import { createClaim } from "@/api/claim";
import { createClaimLocationLink } from "@/api/claim-location";
import { getUser } from "@/api/user";
import Progress from "@/components/progress";

export default function DeclareDisaster() {
    const [step, setStep] = React.useState(-2);
    const [disasterInfo, setDisasterInfo] = React.useState({
        name: "",
        startDate: null as Date | null,
        endDate: null as Date | null,
        location: "", //  business locations id
        description: "",
    });
    const [personalInfo, setPersonalInfo] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
    const [businessInfo, setBusinessInfo] = React.useState({
        businessName: "",
        businessOwner: "",
        businessType: "", // ???
    });
    const [insurerInfo, setInsurerInfo] = React.useState({
        name: "test",
    });

    const { data: businessInfoData, isSuccess: businessInfoSuccess } = useQuery({
        queryKey: ["businessInfo"],
        queryFn: getCompany,
    });

    const { data: userInfoData, isSuccess: userInfoSuccess } = useQuery({
        queryKey: ["userInfo"],
        queryFn: getUser,
    });

    React.useEffect(() => {
        if (businessInfoSuccess) {
            setBusinessInfo({
                businessName: businessInfoData.name,
                businessOwner: businessInfoData.businessOwnerFullName,
                businessType: "",
            });
        }
        if (userInfoSuccess) {
            setPersonalInfo({
                firstName: userInfoData.firstName,
                lastName: userInfoData.lastName,
                email: userInfoData.email ?? "",
                phone: "",
            });
        }
    }, [businessInfoSuccess, userInfoSuccess, businessInfoData, userInfoData]);

    const { mutate: createClaimLocationMutation } = useMutation({
        mutationFn: (claimId: string) =>
            createClaimLocationLink({ claimId: claimId, locationAddressId: disasterInfo.location }),
        onSuccess: () => {
            setStep(6); // Move to export step
        },
        onError: (error) => {
            console.error("Error creating claim location link:", error);
        },
    });

    const { mutate: createClaimMutation } = useMutation({
        mutationFn: (disasterId: string) => createClaim({ selfDisasterId: disasterId }),
        onSuccess: (data) => {
            createClaimLocationMutation(data.id);
        },
        onError: (error) => {
            console.error("Error creating claim:", error);
        },
    });

    const { mutate: createSelfDisasterMutation } = useMutation({
        mutationFn: async () => {
            const payload = {
                name: disasterInfo.name,
                description: disasterInfo.description,
                startDate:
                    disasterInfo.startDate?.toISOString().split("T")[0] ?? new Date().toISOString().split("T")[0],
                endDate: disasterInfo.endDate?.toISOString().split("T")[0],
            };
            return await createSelfDisaster(payload);
        },
        onSuccess: (data) => {
            createClaimMutation(data.id);
        },
        onError: (error) => {
            console.error("Error creating self disaster:", error);
        },
    });

    const handleStepForward = () => {
        if (step === 5) {
            createSelfDisasterMutation();
            return;
        }
        setStep(step + 1);
    };

    const handleStepBack = () => {
        setStep(step - 1);
    };

    // Query for company locations
    const { data: companyLocations } = useQuery({
        queryKey: ["companyLocations"],
        queryFn: getCompanyLocations,
    });

    React.useEffect(() => {}, [disasterInfo]);

    const steps = [
        {
            step: -2,
            render: <StartStep handleStepForward={handleStepForward} />,
        },
        {
            step: -1,
            render: (
                <IncidentDateStep
                    incidentDate={disasterInfo.startDate}
                    setIncidentDate={(date: Date) => {
                        setDisasterInfo((prev) => ({ ...prev, startDate: date }));
                    }}
                    incidentEndDate={disasterInfo.endDate}
                    setIncidentEndDate={(date: Date) => setDisasterInfo((prev) => ({ ...prev, endDate: date }))}
                    handleStepForward={handleStepForward}
                    handleStepBack={handleStepBack}
                />
            ),
        },
        {
            step: 0,
            render: (
                <DisasterInfoStep
                    disasterInfo={disasterInfo}
                    setInfo={(info) => setDisasterInfo((prev) => ({ ...prev, ...info }))}
                    handleStepForward={handleStepForward}
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
                    setInfo={(info) => setPersonalInfo((prev) => ({ ...prev, ...info }))}
                    handleStepForward={handleStepForward}
                    handleStepBack={handleStepBack}
                />
            ),
        },
        {
            step: 2,
            render: (
                <BusinessInfoStep
                    businessInfo={businessInfo}
                    setInfo={(info) => setBusinessInfo((prev) => ({ ...prev, ...info }))}
                    handleStepForward={handleStepForward}
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
                    setInfo={(info) => setInsurerInfo((prev) => ({ ...prev, ...info }))}
                    handleStepForward={handleStepForward}
                    handleStepBack={handleStepBack}
                />
            ),
        },
        {
            step: 4,
            render: <ExportStep />,
        },
    ];

    const currentStep = steps.find((s) => s.step === step);

    return (
        <div className={`flex flex-col px-[20%] pt-[70px] min-h-screen pb-8 ${step === 1 && "justify-center"}`}>
            {step > -1 && step !== 5 && (
                <div className="">
                    <h2 className="text-[40px] font-bold ">Declare Disaster</h2>
                    <Progress
                        progress={step}
                        items={["Disaster Info", "Business Info", "Personal Info", "Insurer Info", "Export Report"]}
                    />
                </div>
            )}
            {currentStep?.render}
        </div>
    );
}
