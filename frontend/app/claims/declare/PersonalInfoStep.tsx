"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { validatePersonalInfo } from "./utils/validationUtils";

type PersonalInfo = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
};

type Props = {
    personalInfo: PersonalInfo;
    setPersonalInfo: (info: Partial<PersonalInfo>) => void;
    handleStepForward: (data: Partial<PersonalInfo>) => void;
    handleStepBack: () => void;
};

export default function PersonalInfoStep({ personalInfo, setPersonalInfo, handleStepForward, handleStepBack }: Props) {
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const validateForm = () =>
        validatePersonalInfo(
            personalInfo.firstName,
            personalInfo.lastName,
            personalInfo.email,
            personalInfo.phone,
            setErrors
        );

    const handleProceed = () => {
        if (validateForm()) {
            handleStepForward(personalInfo);
        }
    };

    return (
        <div className="flex flex-col gap-[40px] h-full">
            <h3 className="text-[25px] font-bold">Personal Information</h3>
            <Card className="flex flex-col gap-2 p-[25px] pb-[30px] border-1">
                <div className="w-1/2">
                    <Label className="text-[16px]">
                        First name<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        className={`h-[58px] rounded-[10px] text-[16px] ${errors.firstName ? "border-red-500" : ""}`}
                        value={personalInfo.firstName}
                        onChange={(e) => {
                            setPersonalInfo({ firstName: e.target.value });
                            if (errors.firstName) setErrors({ ...errors, firstName: "" });
                        }}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div className="w-1/2">
                    <Label className="text-[16px]">
                        Last name<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        className={`h-[58px] rounded-[10px] text-[16px] ${errors.lastName ? "border-red-500" : ""}`}
                        value={personalInfo.lastName}
                        onChange={(e) => {
                            setPersonalInfo({ lastName: e.target.value });
                            if (errors.lastName) setErrors({ ...errors, lastName: "" });
                        }}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                <div className="w-1/2">
                    <Label className="text-[16px]">Phone Number</Label>
                    <Input
                        placeholder="(---) --- ----"
                        className={`h-[58px] rounded-[10px] text-[16px] ${errors.phone ? "border-red-500" : ""}`}
                        value={personalInfo.phone}
                        onChange={(e) => {
                            setPersonalInfo({ phone: e.target.value });
                            if (errors.phone) setErrors({ ...errors, phone: "" });
                        }}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="w-1/2">
                    <Label className="text-[16px]">
                        Email<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        type="email"
                        className={`h-[58px] rounded-[10px] text-[16px] ${errors.email ? "border-red-500" : ""}`}
                        value={personalInfo.email}
                        onChange={(e) => {
                            setPersonalInfo({ email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
            </Card>

            <div className="flex justify-end gap-[25px]">
                <Button className="flex-1/2 px-[20px] py-[12px] h-fit rounded-50 text-[16px]" onClick={handleStepBack}>
                    Back
                </Button>
                <Button
                    className="flex-1/2 px-[20px] py-[12px] h-fit rounded-50 text-[16px] text-white bg-[#2e2f2d]"
                    onClick={handleProceed}
                >
                    Proceed to Business Information
                </Button>
            </div>
        </div>
    );
}
