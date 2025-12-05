"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalInfo } from "@/types/claim";
import React from "react";
import { validatePersonalInfo } from "./utils/validationUtils";

type Props = {
    personalInfo: PersonalInfo;
    setPersonalInfo: (info: Partial<PersonalInfo>) => void;
    handleStepForward: (data: Partial<PersonalInfo>) => void;
    handleStepBack: () => void;
};

export default function PersonalInfoStep({ personalInfo, setPersonalInfo, handleStepForward, handleStepBack }: Props) {
    const [errors, setErrors] = React.useState<Partial<Record<keyof PersonalInfo, string>>>({});

    const validateForm = () => validatePersonalInfo(personalInfo, setErrors);

    const handleProceed = () => {
        if (validateForm()) {
            handleStepForward(personalInfo);
        }
    };

    return (
        <div className="flex flex-col gap-[40px] h-full">
            <h3 className="text-[25px] font-bold">Personal Information</h3>
            <Card className="p-[25px] pb-[30px] border-1">
                <div className="w-1/2 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="first-name">
                            First name<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="first-name"
                            className="h-10 bg-white shadow-none rounded-[10px]"
                            value={personalInfo.firstName ?? ""}
                            onChange={(e) => setPersonalInfo({ firstName: e.target.value })}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="last-name">
                            Last name<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="last-name"
                            className="h-10 bg-white shadow-none rounded-[10px]"
                            value={personalInfo.lastName ?? ""}
                            onChange={(e) => setPersonalInfo({ lastName: e.target.value })}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="">
                            Phone<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            className="h-10 bg-white shadow-none rounded-[10px]"
                            value={personalInfo.phone ?? ""}
                            onChange={(e) => setPersonalInfo({ phone: e.target.value })}
                        />
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="">
                            Email<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            type="email"
                            className="h-10 bg-white shadow-none rounded-[10px]"
                            value={personalInfo.email ?? ""}
                            onChange={(e) => setPersonalInfo({ email: e.target.value })}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                </div>
            </Card>

            <div className="flex items-center justify-end gap-3 w-full">
                <Button onClick={handleStepBack} className="text-sm bg-light-fuchsia text-fuchsia hover:bg-fuchsia hover:text-white w-[70px]" size="lg">
                    Back
                </Button>
                <Button
                    size="lg"
                    onClick={handleProceed}
                    className="bg-fuchsia text-white hover:bg-pink hover:text-fuchsia px-[20px] py-[12px] w-[230px] h-[42px] text-[14px] rounded-50"
                >
                    Proceed to Business Information
                </Button>
            </div>
        </div>
    );
}
