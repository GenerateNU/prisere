import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CreateInsurancePolicyRequest, UpdateInsurancePolicyRequest } from "@/types/insurance-policy";
import React from "react";
import { FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi2";
import { IoCheckmark } from "react-icons/io5";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InsuranceEditorProps {
    insurance: CreateInsurancePolicyRequest | UpdateInsurancePolicyRequest;
    setInsurance: (insurance: CreateInsurancePolicyRequest | UpdateInsurancePolicyRequest) => void;
    removeInsurance: () => void;
    isExpanded?: boolean;
    onExpand: () => void;
    onCollapse: () => void;
    saveError?: string | null;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function InsuranceEditor({
    insurance,
    isSelected,
    onClick,
    setInsurance,
    removeInsurance,
    isExpanded,
    onExpand,
    onCollapse,
    saveError = null,
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
            setError("Please fill in all required fields before saving an insurance.");
            return;
        }
        setError(null);
        onCollapse();
    };

    return (
        <Card
            className={cn(
                "w-full mb-[16px] px-[28px] py-[20px] gap-[16px] border border-transparent",
                isSelected && "border-fuchsia",
                onClick && "cursor-pointer"
            )}
            onClick={onClick}
        >
            <div className="flex justify-between items-center">
                <div className="w-3/4 flex gap-[10px] items-center">
                    {!isExpanded ? (
                        <p className="text-[16px] font-bold">
                            {insurance.policyName !== "" ? insurance.policyName : "Insurance Name"}
                        </p>
                    ) : (
                        <div className="w-full">
                            <Label htmlFor="alias" className="text-[16px] mb-[8px]">
                                Title <span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="policyName"
                                name="policyName"
                                type="text"
                                value={insurance.policyName}
                                required
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                onChange={(e) => setInsurance({ ...insurance, policyName: e.target.value })}
                            />
                        </div>
                    )}
                </div>
                <div className="flex gap-[8px] self-start">
                    <Button
                        onClick={() => {
                            if (isExpanded) {
                                handleCollapse();
                            } else {
                                onExpand();
                            }
                        }}
                        style={{ paddingInline: 0 }}
                        className={`group p-0 flex items-center justify-center h-[35px] w-[35px] ${isExpanded ? "bg-[var(--fuchsia)] hover:bg-pink hover:text-fuchsia" : "bg-[var(--slate)] hover:bg-fuchsia hover:text-white"}`}
                    >
                        <FiEdit className={`${isExpanded ? "text-white group-hover:text-fuchsia" : "text-black group-hover:text-white"} text-[20px]`} />
                    </Button>
                    <Button
                        onClick={() => removeInsurance()}
                        style={{ paddingInline: 0 }}
                        className="group p-0 flex items-center justify-center h-[35px] w-[35px] bg-[var(--slate)] hover:bg-fuchsia hover:text-white"
                    >
                        <HiOutlineTrash className="hover:text-white" />
                    </Button>
                </div>
            </div>
            {!isExpanded && <hr />}
            {isExpanded ? (
                <div className="flex flex-col gap-[16px]">
                    <div className="flex flex-col gap-[8px] w-full">
                        <Label htmlFor="insuranceType" className="text-[16px]">
                            Insurance Type<span className="text-red-500 text-[16px]">*</span>
                        </Label>
                        <Select
                            onValueChange={(value) => setInsurance({ ...insurance, insuranceType: value })}
                            value={insurance.insuranceType}
                        >
                            <SelectTrigger
                                id="insuranceType"
                                style={{
                                    height: "45px",
                                    width: "100%",
                                    padding: "16px 28px",
                                    fontSize: "16px",
                                    borderRadius: "10px",
                                    backgroundColor: "transparent",
                                }}
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
                    <div className="flex gap-[16px]">
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="policyHolderLastName" className="text-[16px]">
                                Insured First Name<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="policyHolderLastName"
                                name="policyHolderLastName"
                                type="text"
                                required
                                value={insurance.policyHolderFirstName ?? ""}
                                onChange={(e) => setInsurance({ ...insurance, policyHolderFirstName: e.target.value })}
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                            />
                        </div>
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="policyHolderLastName" className="text-[16px]">
                                Insured Last Name<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="policyHolderLastName"
                                name="policyHolderLastName"
                                type="text"
                                required
                                value={insurance.policyHolderLastName ?? ""}
                                onChange={(e) => setInsurance({ ...insurance, policyHolderLastName: e.target.value })}
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-[8px] w-full">
                        <Label htmlFor="insuranceCompanyName" className="text-[16px]">
                            Insurance Company<span className="text-red-500 text-[16px]">*</span>
                        </Label>
                        <Input
                            id="insuranceCompanyName"
                            name="insuranceCompanyName"
                            type="text"
                            required
                            value={insurance.insuranceCompanyName ?? ""}
                            onChange={(e) => setInsurance({ ...insurance, insuranceCompanyName: e.target.value })}
                            className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                        />
                    </div>
                    <div className="flex flex-col gap-[8px] w-full">
                        <Label htmlFor="state" className="text-[16px]">
                            Policy Number<span className="text-red-500 text-[16px]">*</span>
                        </Label>
                        <Input
                            id="state"
                            name="state"
                            type="text"
                            required
                            value={insurance.policyNumber ?? ""}
                            onChange={(e) => setInsurance({ ...insurance, policyNumber: e.target.value })}
                            className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                        />
                    </div>
                    {error || saveError ? (
                        <p className="text-red-400 text-[14px] self-center">{error || saveError}</p>
                    ) : (
                        ""
                    )}
                    <Button
                        className="group text-[14px] py-[7px] bg-[var(--pink)] text-[var(--fuchsia)] hover:bg-fuchsia hover:text-white self-end w-fit h-fit flex justify-center items-center gap-[8px]"
                        onClick={handleCollapse}
                        style={{ paddingInline: "25px" }}
                    >
                        Save and close <IoCheckmark className="text-[24px] mb-[2px] group-hover:text-white" />
                    </Button>
                </div>
            ) : (
                <div className="flex gap-[40px]">
                    <div className="flex flex-col gap-[20px] max-w-1/2">
                        <div className="flex flex-col gap-[4px] overflow-hidden truncate text-ellipsis">
                            <p className="font-bold text-[16px]">Insurance Company</p>
                            <p>{insurance.insuranceCompanyName}</p>
                        </div>
                        <div className="flex flex-col gap-[4px]">
                            <p className="font-bold text-[16px]">Insured Name</p>
                            <p>
                                {insurance.policyHolderFirstName} {insurance.policyHolderLastName}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[20px] max-w-1/2">
                        <div className="flex flex-col gap-[4px]">
                            <p className="font-bold text-[16px]">Insurance Type</p>
                            <p>{insurance.insuranceType}</p>
                        </div>
                        <div className="flex flex-col gap-[4px]">
                            <p className="font-bold text-[16px]">Policy Number</p>
                            <p>{insurance.policyNumber}</p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
