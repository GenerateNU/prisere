import EditPencil from "@/icons/EditPencil";
import TrashCan from "@/icons/TrashCan";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CreateInsurancePolicyRequest } from "@/types/insurance-policy";

interface InsuranceEditorProps {
    insurance: CreateInsurancePolicyRequest;
    setInsurance: (insurance: CreateInsurancePolicyRequest) => void;
    removeInsurance: () => void;
    isExpanded?: boolean;
    onExpand: () => void;
    onCollapse: () => void;
}

export default function InsuranceEditor({
    insurance,
    setInsurance,
    removeInsurance,
    isExpanded,
    onExpand,
    onCollapse,
}: InsuranceEditorProps) {
    const [error, setError] = React.useState<string | null>(null);

    const insuranceTypes = [
        "Health Insurance",
        "Auto Insurance",
        "Home Insurance",
        "Life Insurance",
        "Disability Insurance",
    ];

    const handleCollapse = () => {
        if (
            !insurance.policyName ||
            !insurance.insuranceType ||
            !insurance.policyHolderFirstName ||
            !insurance.policyHolderLastName ||
            !insurance.insuranceCompanyName ||
            !insurance.policyNumber
        ) {
            setError("Please fill in all required fields before saving.");
            return;
        }
        setError(null);
        onCollapse();
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                <div className="flex gap-[10px] items-center">
                    {!isExpanded ? (
                        <p className="text-[24px] font-bold">
                            {insurance.policyName !== "" ? insurance.policyName : "Insurance Name"}
                        </p>
                    ) : (
                        <Input
                            id="policyName"
                            name="policyName"
                            type="text"
                            placeholder="Insurance Name"
                            value={insurance.policyName}
                            required
                            className="bg-transparent placeholder:text-gray-400 rounded-sm h-[35px]"
                            onChange={(e) => setInsurance({ ...insurance, policyName: e.target.value })}
                        />
                    )}
                    {!isExpanded ? (
                        <span onClick={onExpand}>
                            <EditPencil />
                        </span>
                    ) : (
                        <Button
                            variant="link"
                            className="p-0 text-[14px] w-fit h-fit underline"
                            onClick={handleCollapse}
                        >
                            Collapse
                        </Button>
                    )}
                </div>
                <span onClick={removeInsurance}>
                    <TrashCan />
                </span>
            </div>
            <hr className="mt-[16px] mb-[16px]" />
            {error ? <p className="text-red-400 mb-[16px]">{error}</p> : ""}
            {isExpanded ? (
                <div className="flex flex-col gap-[16px]">
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="insuranceType" className="text-[20px]">
                            Insurance Type<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => setInsurance({ ...insurance, insuranceType: value })}
                            value={insurance.insuranceType}
                        >
                            <SelectTrigger
                                id="insuranceType"
                                className="w-full rounded-full text-[16px] bg-stone-100"
                                style={{ height: "85px" }}
                            >
                                <SelectValue placeholder="Select insurance type" />
                            </SelectTrigger>
                            <SelectContent>
                                {insuranceTypes.map((type) => (
                                    <SelectItem key={type} value={type} className="text-[16px]">
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="policyHolderLastName" className="text-[20px]">
                            Insured First Name<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="policyHolderLastName"
                            name="policyHolderLastName"
                            type="text"
                            required
                            value={insurance.policyHolderFirstName ?? ""}
                            onChange={(e) => setInsurance({ ...insurance, policyHolderFirstName: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="policyHolderLastName" className="text-[20px]">
                            Insured Last Name<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="policyHolderLastName"
                            name="policyHolderLastName"
                            type="text"
                            required
                            value={insurance.policyHolderLastName ?? ""}
                            onChange={(e) => setInsurance({ ...insurance, policyHolderLastName: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="insuranceCompanyName" className="text-[20px]">
                            Insurance Company<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="insuranceCompanyName"
                            name="insuranceCompanyName"
                            type="text"
                            required
                            value={insurance.insuranceCompanyName ?? ""}
                            onChange={(e) => setInsurance({ ...insurance, insuranceCompanyName: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="state" className="text-[20px]">
                            Policy Number<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="state"
                            name="state"
                            type="text"
                            required
                            value={insurance.policyNumber ?? ""}
                            onChange={(e) => setInsurance({ ...insurance, policyNumber: e.target.value })}
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <p>
                        {insurance.policyHolderFirstName} {insurance.policyHolderLastName}
                    </p>
                    <p>{insurance.insuranceType}</p>
                    <p>{insurance.policyNumber}</p>
                </div>
            )}
        </div>
    );
}
