import { createInsurancePolicyBulk } from "@/api/insurance";
import InsuranceEditor from "@/components/InsuranceEditor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CreateInsurancePolicyBulkRequest, CreateInsurancePolicyRequest } from "@/types/insurance-policy";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { Dispatch } from "react";
import { SetStateAction } from "react";

interface InsuranceInfoProps {
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
}

export default function Insurance({ progress, setProgress }: InsuranceInfoProps) {
    const [insurancePayload, setInsurancePayload] = React.useState<CreateInsurancePolicyBulkRequest>([
        {
            policyName: "",
            insuranceType: "",
            policyHolderFirstName: "",
            policyHolderLastName: "",
            insuranceCompanyName: "",
            policyNumber: "",
        },
    ]);

    const { mutate: bulkCreateInsurance, isPending: createInsurancePending } = useMutation({
        mutationFn: () => createInsurancePolicyBulk(insurancePayload),
        onSuccess: () => {
            setProgress(progress + 1);
        },
        onError: (error: Error) => {
            setError(error.message || "An error occurred while creating insurance policies.");
        },
    });

    const [error, setError] = React.useState<string | null>(null);

    const [editingInsuranceIndex, setEditingInsuranceIndex] = React.useState<number | null>(0);

    const updateInsurance = (index: number, insurance: CreateInsurancePolicyRequest) => {
        const newInsurances = [...insurancePayload];
        newInsurances[index] = insurance;
        setInsurancePayload(newInsurances);
    };

    const addInsurance = () => {
        setInsurancePayload([
            ...insurancePayload,
            {
                policyName: "",
                insuranceType: "",
                policyHolderFirstName: "",
                policyHolderLastName: "",
                insuranceCompanyName: "",
                policyNumber: "",
            },
        ]);
        setEditingInsuranceIndex(insurancePayload.length);
    };

    const removeInsurance = (index: number) => {
        setInsurancePayload((prev) => prev.filter((_, i) => i !== index));
        setEditingInsuranceIndex(null);
    };

    const handleNext = () => {
        if (insurancePayload.length === 0) {
            setError("Please add at least one insurance policy or choose to add later.");
            return;
        }
        setEditingInsuranceIndex(null);
        bulkCreateInsurance();
    };

    return (
        <div className="max-w-lg w-full space-y-[30px]">
            <div className="flex justify-center">
                <label className="block text-[30px] text-black font-bold my-[30px]"> Insurance Information </label>
            </div>
            {insurancePayload.map((insurance, index) => (
                <InsuranceEditor
                    key={index}
                    insurance={insurance}
                    setInsurance={(i) => updateInsurance(index, i)}
                    removeInsurance={() => removeInsurance(index)}
                    isExpanded={editingInsuranceIndex === index}
                    onExpand={() => setEditingInsuranceIndex(index)}
                    onCollapse={() => setEditingInsuranceIndex(null)}
                />
            ))}
            <Button
                variant="link"
                className="w-fit h-fit self-start px-0 font-bold underline hover:text-gray-600"
                onClick={addInsurance}
            >
                + Add Insurance
            </Button>
            <div className="w-full flex flex-col gap-2 items-center">
                <Button type="button" onClick={handleNext} className="bg-[var(--teal)] text-white">
                    {createInsurancePending ? <Spinner /> : <></>}
                    Next
                </Button>
                {error && <p className="text-red-500 text-sm"> {error} </p>}
            </div>
            <div className="w-full flex flex-col items-center">
                <Button
                    type="button"
                    variant="link"
                    onClick={() => setProgress(progress + 1)}
                    className="underline hover:text-stone-200 h-fit font-[16px]"
                >
                    I&apos;ll add later
                </Button>
            </div>
        </div>
    );
}
