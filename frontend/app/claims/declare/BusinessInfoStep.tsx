"use client";

import RevenueAndExpenses from "@/components/dashboard/RevenueAndExpenses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BusinessInfo } from "@/types/claim";
import { CompanyTypes, CompanyTypesEnum } from "@/types/company";
import React from "react";
import { validateBusinessInfo } from "./utils/validationUtils";

type Props = {
    businessInfo: BusinessInfo;
    setBusinessInfo: (info: Partial<BusinessInfo>) => void;
    handleStepForward: (data: Partial<BusinessInfo>) => void;
    handleStepBack: () => void;
};

export default function BusinessInfoStep({ businessInfo, setBusinessInfo, handleStepForward, handleStepBack }: Props) {
    const [errors, setErrors] = React.useState<Partial<Record<keyof BusinessInfo, string>>>({});

    const validateForm = () => validateBusinessInfo(businessInfo, setErrors);

    const handleProceed = () => {
        if (validateForm()) {
            const validatedData = {
                businessName: businessInfo.businessName.trim(),
                businessOwner: businessInfo.businessOwner.trim(),
                businessType: businessInfo.businessType,
            };
            handleStepForward(validatedData);
        }
    };

    return (
        <div className="flex flex-col gap-[40px] h-full">
            <h3 className="text-[25px] font-bold">Business Information</h3>
            <Card className="flex flex-col gap-8 p-[25px] pb-[30px] border-1">
                <div className="flex flex-col gap-5 w-1/2">
                    <div className="flex flex-col gap-2">
                        <Label>
                            Business Name<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            className="h-10 bg-white shadow-none rounded-[10px]"
                            value={businessInfo.businessName ?? ""}
                            onChange={(e) => setBusinessInfo({ businessName: e.target.value })}
                        />
                        {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>
                            Business Owner<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            className="h-10 bg-white shadow-none rounded-[10px]"
                            value={businessInfo.businessOwner ?? ""}
                            onChange={(e) => setBusinessInfo({ businessOwner: e.target.value })}
                        />
                        {errors.businessOwner && <p className="text-red-500 text-sm mt-1">{errors.businessOwner}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>
                            Business Type<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select
                            onValueChange={(t) => setBusinessInfo({ businessType: t as CompanyTypesEnum })}
                            value={businessInfo.businessType}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                                {CompanyTypes.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="font-bold text-[24px]">Financial History</p>
                    <p>We will use a 3 years average of your revenues and expense data for the report.</p>
                    <div className="border border-gray-300 rounded-lg">
                        <RevenueAndExpenses onDashboard={false} />
                    </div>
                </div>
            </Card>
            <div className="flex items-center justify-end gap-3 w-full">
                <Button onClick={handleStepBack} className="text-sm bg-light-fuchsia text-fuchsia w-[70px]" size="lg">
                    Back
                </Button>
                <Button
                    size="lg"
                    onClick={handleProceed}
                    className="bg-fuchsia text-white px-[20px] py-[12px] w-[230px] h-[42px] text-[14px] rounded-50"
                >
                    Proceed to Insurance Information
                </Button>
            </div>
        </div>
    );
}
