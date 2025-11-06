import { createInsurancePolicyBulk } from "@/api/insurance";
import InsuranceEditor from "@/components/InsuranceEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import AddCircle from "@/icons/AddCircle";
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
        <Card className="w-full px-[163px] py-[127px] gap-0">
            <div className="flex justify-center items-center flex-col gap-[10px]">
                <div className="w-fit h-fit text-[12px] px-[8px] py-[4px] font-bold rounded-[4px] text-[var(--teal)] bg-[var(--light-teal)]">
                    OPTIONAL
                </div>
                <label className="block text-[30px] text-black font-bold mb-[60px]"> Insurance Information </label>
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
                className="w-fit self-start flex items-center text-[16px] h-[24px] p-0 underline hover:text-gray-600"
                style={{ paddingInline: 0 }}
                onClick={addInsurance}
            >
                <AddCircle /> Add Insurance
            </Button>
            <div>
                <div className="w-full flex flex-col items-center gap-2 mb-[20px]">
                    <Button
                        type="button"
                        onClick={handleNext}
                        className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white px-[20px] py-[12px] text-[16px]"
                    >
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
                        className="underline hover:text-stone-200 h-fit w-fit text-[12px] font-bold p-0"
                    >
                        Skip for now
                    </Button>
                </div>
            </div>
        </Card>
    );
}
