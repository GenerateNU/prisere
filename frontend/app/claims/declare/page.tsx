'use client';

import React from "react";
import BusinessInfoStep from "./BusinessInfoStep";
import DisasterInfoStep from "./DisasterInfoStep";
import ExportStep from "./ExportStep";
import InsurerInfoStep from "./InsurerInfoStep";
import PersonalInfoStep from "./PersonalInfoStep";
import ProgressBar from "./ProgressBar";
import StartStep from "./StartStep";
import IncidentDateStep from "./IncidentDateStep";
import { getCompanyLocations } from "@/api/company";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createSelfDisaster } from "@/api/self-disaster";
import { createClaim } from "@/api/claim";
import { createClaimLocationLink } from "@/api/claim-location";

export default function DeclareDisaster() {
    const [step, setStep] = React.useState(0);
    const [disasterInfo, setDisasterInfo] = React.useState({
        name: "",
        dateOfIncident: new Date(), // date
        location: "", // from business locations
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
    const [insurerInfo, setInsurerInfo] = React.useState({});

    const { mutate: createClaimLocationMutation } = useMutation({
        mutationFn: (claimId: string) => createClaimLocationLink({ claimId: claimId, locationAddressId: disasterInfo.location }),
        onSuccess: (data) => {
            console.log("Claim location link created:", data);
            setStep(6); // Move to export step
        },
        onError: (error) => {
            console.error("Error creating claim location link:", error);
        }
    })

    const { mutate: createClaimMutation } = useMutation({
        mutationFn: (disasterId: string) => createClaim({ selfDisasterId: disasterId }),
        onSuccess: (data) => {
            console.log("Claim created:", data);
            createClaimLocationMutation(data.id);
        },
        onError: (error) => {
            console.error("Error creating claim:", error);
        }
    });

    const { mutate: createSelfDisasterMutation } = useMutation({
        mutationFn: () => createSelfDisaster({ name: disasterInfo.name, description: disasterInfo.description, startDate: disasterInfo.dateOfIncident.toISOString().split('T')[0] }),
        onSuccess: (data) => {
            console.log("Self disaster created:", data);
            createClaimMutation(data.id);
        },
        onError: (error) => {
            console.error("Error creating self disaster:", error);
        }
    });

    const handleStepForward = () => {
        if (step === 5) {
            console.log("INFO LOG ", disasterInfo)
            createSelfDisasterMutation();
            return;
        }
        setStep(step + 1);
    }

    const handleStepBack = () => {
        setStep(step - 1);
    }

    // Query for company locations
    const { data: companyLocations } = useQuery({
        queryKey: ['companyLocations'],
        queryFn: getCompanyLocations,
    })

    const steps = [
        {
            step: 0,
            render: <StartStep handleStepForward={handleStepForward} />
        },
        {
            step: 1,
            render: <IncidentDateStep
                incidentDate={disasterInfo.dateOfIncident}
                setIncidentDate={(date: Date) => setDisasterInfo({ ...disasterInfo, dateOfIncident: date })}
                handleStepForward={handleStepForward}
                handleStepBack={handleStepBack}
            />
        },
        {
            step: 2,
            render: <DisasterInfoStep disasterInfo={disasterInfo}
                setInfo={(info) => setDisasterInfo({ ...disasterInfo, ...info })}
                handleStepForward={handleStepForward}
                handleStepBack={handleStepBack}
                locations={companyLocations} />
        },
        {
            step: 3,
            render: <PersonalInfoStep personalInfo={personalInfo}
                setInfo={(info) => setPersonalInfo({ ...personalInfo, ...info })}
                handleStepForward={handleStepForward}
                handleStepBack={handleStepBack}
            />
        },
        {
            step: 4,
            render: <BusinessInfoStep businessInfo={businessInfo}
                setInfo={(info) => setBusinessInfo({ ...businessInfo, ...info })}
                handleStepForward={handleStepForward}
                handleStepBack={handleStepBack}
                locations={companyLocations} />
        },
        {
            step: 5,
            render: <InsurerInfoStep insurerInfo={insurerInfo}
                setInfo={(info) => setInsurerInfo({ ...insurerInfo, ...info })}
                handleStepForward={handleStepForward}
                handleStepBack={handleStepBack} />
        },
        {
            step: 6,
            render: <ExportStep />
        },
    ]

    const currentStep = steps.find((s) => s.step === step);

    return (
        <div className={`flex flex-col px-[20%] pt-[70px] min-h-screen pb-8 ${step < 2 && "justify-center"}`} >
            {(step > 1 && step !== 7) &&
                <>
                    <h2 className="text-[40px] font-bold ">Declare Disaster</h2>
                    <ProgressBar step={step} />
                </>
            }
            {currentStep?.render}
        </div>
    );
}