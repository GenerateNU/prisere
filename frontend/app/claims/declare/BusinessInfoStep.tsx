"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SelectContent, SelectItem, SelectTrigger, SelectValue, Select } from "@/components/ui/select";
import React from "react";
import RevenueAndExpenses from "@/components/dashboard/RevenueAndExpenses";
import { GetCompanyLocationsResponse } from "@/types/company";

type BusinessInfo = {
    businessName: string;
    businessOwner: string;
    businessType: string;
};

type Props = {
    businessInfo: BusinessInfo;
    setInfo: React.Dispatch<React.SetStateAction<BusinessInfo>>;
    handleStepForward: () => void;
    handleStepBack: () => void;
    locations: GetCompanyLocationsResponse | undefined;
};

export default function BusinessInfoStep({
    businessInfo,
    setInfo,
    handleStepForward,
    handleStepBack,
    locations,
}: Props) {
    const businessTypes = ["Type 1", "Type 2", "Type 3"];
    const [businessName, setBusinessName] = React.useState(businessInfo.businessName);
    const [businessOwner, setBusinessOwner] = React.useState(businessInfo.businessOwner);
    const [businessType, setBusinessType] = React.useState(businessInfo.businessType);
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!businessName.trim()) {
            newErrors.businessName = "Business name is required";
        }

        if (!businessOwner.trim()) {
            newErrors.businessOwner = "Business owner is required";
        }

        if (!businessType) {
            newErrors.businessType = "Business type is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceed = () => {
        if (validateForm()) {
            setInfo({
                businessName: businessName.trim(),
                businessOwner: businessOwner.trim(),
                businessType: businessType,
            });
            handleStepForward();
        }
    };

    return (
        <div className="flex flex-col gap-[40px] h-full">
            <h3 className="text-[25px] font-bold">Business Information</h3>
            <Card className="flex flex-col gap-8 p-[25px] pb-[30px] border-1">
                <div className="">
                    <Label className="text-[16px]">
                        Business name<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        className={`h-[58px] rounded-[10px] text-[16px] ${errors.businessName ? "border-red-500" : ""}`}
                        value={businessName}
                        onChange={(e) => {
                            setBusinessName(e.target.value);
                            if (errors.businessName) setErrors({ ...errors, businessName: "" });
                        }}
                    />
                    {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                </div>
                <div className="">
                    <Label className="text-[16px]">
                        Business owner<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        className={`h-[58px] rounded-[10px] text-[16px] ${errors.businessOwner ? "border-red-500" : ""}`}
                        value={businessOwner}
                        onChange={(e) => {
                            setBusinessOwner(e.target.value);
                            if (errors.businessOwner) setErrors({ ...errors, businessOwner: "" });
                        }}
                    />
                    {errors.businessOwner && <p className="text-red-500 text-sm mt-1">{errors.businessOwner}</p>}
                </div>
                <div className="w-1/2">
                    <Label className="text-[16px]">Business type</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                        <SelectTrigger className="w-full h-[58px] rounded-[10px] text-[16px] ">
                            <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                            {businessTypes.map((type) => (
                                <SelectItem key={type} value={type} className="text-[16px]">
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <p className="font-semibold text-[16px]">Business Location(s)</p>
                    <div className="flex gap-8 mt-[30px]">
                        {locations?.map((location) => (
                            <div key={location.id}>
                                <div className="text-[18px]">{location.alias}</div>
                                <hr className="my-2" />
                                <div className="text-[18px]">
                                    <p>{location.streetAddress}</p>
                                    <p>{`${location.city}, ${location.stateProvince} ${location.postalCode}`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="font-semibold text-[16px]">Financial History</p>
                    <p className="text-[20px]">
                        We will use a 3 years average of your revenues and expense data for the report.
                    </p>
                    <RevenueAndExpenses showLinks={false} />
                </div>
            </Card>
            <div className="flex justify-end gap-[25px]">
                <Button className="flex-1/2 px-[20px] py-[12px]  h-fit rounded-50 text-[16px]" onClick={handleStepBack}>
                    Back
                </Button>
                <Button
                    className="flex-1/2 px-[20px] py-[12px] h-fit rounded-50 text-[16px] text-white bg-[#2e2f2d]"
                    onClick={handleProceed}
                >
                    Proceed to Insurance Information
                </Button>
            </div>
        </div>
    );
}
