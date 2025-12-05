"use client";

import {
    createInsurancePolicy,
    deleteInsurancePolicy,
    getInsurancePolicies,
    updateInsurancePolicy,
} from "@/api/insurance";
import { useServerActionQuery } from "@/api/requestHandlers";
import InsuranceEditor from "@/components/InsuranceEditor";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateInsurancePolicyRequest, InsurancePolicy, UpdateInsurancePolicyRequest } from "@/types/insurance-policy";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";

export default function InsuranceCard({
    insuranceSelected,
    onInsuranceSelect,
}: {
    insuranceSelected?: InsurancePolicy["id"] | null;
    onInsuranceSelect?: (insuranceId: InsurancePolicy["id"]) => void;
}) {
    const [insuranceInfo, setInsuranceInfo] = useState<(UpdateInsurancePolicyRequest | CreateInsurancePolicyRequest)[]>(
        []
    );
    const [editingInsuranceIndex, setEditingInsuranceIndex] = useState<number | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { data: insuranceQuery, isPending: insurancePending } = useServerActionQuery({
        queryKey: ["insuranceInfo"],
        queryFn: getInsurancePolicies,
    });

    const { mutate: updateInsuranceMutate } = useMutation({
        mutationFn: (insurance: UpdateInsurancePolicyRequest) => updateInsurancePolicy(insurance),
        onSuccess: () => {
            setSaveError(null);
            setEditingInsuranceIndex(null);
        },
        onError: (error: Error) => {
            const errorMessage = error.message || "Error updating policy. Check required fields and try again";
            setSaveError(errorMessage);
        },
    });

    const { mutate: createInsuranceMutate } = useMutation({
        mutationFn: (insurance: CreateInsurancePolicyRequest) => createInsurancePolicy(insurance),
        onSuccess: () => {
            setSaveError(null);
            setEditingInsuranceIndex(null);
        },
        onError: (error: Error) => {
            const errorMessage = error.message || "Error creating policy. Check required fields and try again";
            setSaveError(errorMessage);
        },
    });

    const { mutate: deleteInsuranceMutate } = useMutation({
        mutationFn: (insurancePolicyId: string) => deleteInsurancePolicy(insurancePolicyId),
        onSuccess: () => {
            setSaveError(null);
            setEditingInsuranceIndex(null);
        },
        onError: (_error: Error) => {
            setSaveError("An error occurred while deleting the insurance policy.");
        },
    });

    const updateInsurance = (index: number, insurance: CreateInsurancePolicyRequest | UpdateInsurancePolicyRequest) => {
        const newInsurance = [...insuranceInfo];
        newInsurance[index] = insurance;
        setInsuranceInfo(newInsurance);
    };

    const removeInsurance = (index: number) => {
        const insurance = insuranceInfo[index];

        if ("id" in insurance && insurance.id) {
            deleteInsuranceMutate(insurance.id);
        }

        setInsuranceInfo((prev) => prev.filter((_, i) => i !== index));
        setEditingInsuranceIndex(null);
    };

    const addInsurance = () => {
        setInsuranceInfo([
            ...insuranceInfo,
            {
                policyName: "",
                insuranceType: "",
                policyHolderFirstName: "",
                policyHolderLastName: "",
                insuranceCompanyName: "",
                policyNumber: "",
            },
        ]);
        setEditingInsuranceIndex(insuranceInfo.length);
    };

    const handleSave = () => {
        if (editingInsuranceIndex === null) return;
        if ("id" in insuranceInfo[editingInsuranceIndex]) {
            updateInsuranceMutate(insuranceInfo[editingInsuranceIndex] as UpdateInsurancePolicyRequest);
        } else {
            createInsuranceMutate(insuranceInfo[editingInsuranceIndex] as CreateInsurancePolicyRequest);
        }
    };

    useEffect(() => {
        if (insuranceQuery) {
            setInsuranceInfo(insuranceQuery);
        }
    }, [insuranceQuery]);

    return (
        <Card className="p-[28px] flex gap-[12px] border-none shadow-none">
            <p className="font-bold text-[20px]">Insurance Information</p>
            {insurancePending ? (
                <Loading lines={3} />
            ) : (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insuranceInfo.map((insurance, index) => (
                            <div key={index}>
                                <InsuranceEditor
                                    insurance={insurance}
                                    isSelected={"id" in insurance && insuranceSelected === insurance.id}
                                    onClick={
                                        onInsuranceSelect && "id" in insurance
                                            ? () => onInsuranceSelect(insurance.id)
                                            : undefined
                                    }
                                    setInsurance={(i) => updateInsurance(index, i)}
                                    removeInsurance={() => removeInsurance(index)}
                                    isExpanded={editingInsuranceIndex === index}
                                    onExpand={() =>
                                        editingInsuranceIndex === index
                                            ? setEditingInsuranceIndex(null)
                                            : setEditingInsuranceIndex(index)
                                    }
                                    onCollapse={() => handleSave()}
                                    saveError={saveError}
                                />
                            </div>
                        ))}
                    </div>

                    <Button
                        className="w-[196px] flex items-center text-[16px] h-[34px] self-start px-[12px] py-[4px] w-fit bg-slate hover:bg-fuchsia hover:text-white"
                        onClick={addInsurance}
                    >
                        <IoAddCircleOutline /> Add an Insurance
                    </Button>
                </div>
            )}
        </Card>
    );
}
