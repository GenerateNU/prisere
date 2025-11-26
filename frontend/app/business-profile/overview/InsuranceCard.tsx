"use client";

import { createInsurancePolicy, getInsurancePolicies, updateInsurancePolicy } from "@/api/insurance";
import InsuranceEditor from "@/components/InsuranceEditor";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { CreateInsurancePolicyRequest, UpdateInsurancePolicyRequest } from "@/types/insurance-policy";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";

export default function InsuranceCard() {
    const [insuranceInfo, setInsuranceInfo] = useState<(UpdateInsurancePolicyRequest | CreateInsurancePolicyRequest)[]>(
        []
    );
    const [editingInsuranceIndex, setEditingInsuranceIndex] = useState<number | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { data: insuranceQuery, isPending: insurancePending } = useQuery({
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
            setSaveError("An error occurred while saving the location: " + error.message);
        },
    });

    const { mutate: createInsuranceMutate } = useMutation({
        mutationFn: (insurance: CreateInsurancePolicyRequest) => createInsurancePolicy(insurance),
        onSuccess: () => {
            setSaveError(null);
            setEditingInsuranceIndex(null);
        },
        onError: (error: Error) => {
            setSaveError("An error occurred while saving the location: " + error.message);
        },
    });

    const updateInsurance = (index: number, insurance: CreateInsurancePolicyRequest | UpdateInsurancePolicyRequest) => {
        const newInsurance = [...insuranceInfo];
        newInsurance[index] = insurance;
        setInsuranceInfo(newInsurance);
    };

    const removeInsurance = (index: number) => {
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
        <div>
            {insurancePending ? (
                <Loading lines={3} />
            ) : (
                <div>
                    <div className="flex gap-[38px]">
                        {insuranceInfo.map((insurance, index) => (
                            <div key={index} className="w-1/2">
                                <InsuranceEditor
                                    insurance={insurance}
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
                        className="w-[196px] flex items-center text-[16px] h-[34px] self-start px-[12px] py-[4px] underline bg-slate hover:text-gray-600"
                        onClick={addInsurance}
                    >
                        <IoAddCircleOutline /> Add an Insurance
                    </Button>
                </div>
            )}
        </div>
    );
}
