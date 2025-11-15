"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GetCompanyLocationsResponse } from "@/types/company";
import React from "react";
import { FaCircle } from "react-icons/fa";
import { validateDisasterInfo } from "./utils/validationUtils";

type DisasterInfo = {
    name: string;
    endDate: Date | null;
    startDate: Date | null;
    location: string;
    description: string;
};

type Props = {
    disasterInfo: DisasterInfo;
    setDisasterInfo: (info: Partial<DisasterInfo>) => void;
    handleStepForward: (data: Partial<DisasterInfo>) => void;
    handleStepBack: () => void;
    locations: GetCompanyLocationsResponse | undefined;
};

export default function DisasterInfoStep({
    disasterInfo,
    setDisasterInfo,
    handleStepForward,
    handleStepBack,
    locations,
}: Props) {
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const validateForm = () => validateDisasterInfo(disasterInfo.name, disasterInfo.location, setErrors);

    const handleProceed = () => {
        if (validateForm()) {
            handleStepForward(disasterInfo);
        }
    };

    return (
        <div className="flex flex-col gap-[40px]">
            <h3 className="text-[25px] font-bold">Disaster Specific Information</h3>
            <Card className="p-[25px] border-[1px]">
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">
                        Type of claim being filed <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        className={`h-[58px] rounded-[10px] text-[16px] ${errors.name ? "border-red-500" : ""}`}
                        value={disasterInfo.name}
                        placeholder="Enter a disaster name"
                        onChange={(e) => {
                            setDisasterInfo({ name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">
                        Location of incident <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                        value={disasterInfo.location}
                        onValueChange={(value) => {
                            setDisasterInfo({ location: value });
                            if (errors.location) setErrors({ ...errors, location: "" });
                        }}
                    >
                        <SelectTrigger
                            className={`rounded-full px-[20px] py-[8px] w-[175px] ${errors.location ? "border-red-500" : ""}`}
                        >
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations?.map((l) => (
                                <SelectItem key={l.id} value={l.id} className="text-[16px]">
                                    {l.streetAddress}, {l.city}, {l.stateProvince} {l.postalCode}{" "}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">Description of the incident</Label>
                    <Textarea
                        className="min-h-64 text-[16px]"
                        rows={5}
                        placeholder="Begin typing or "
                        value={disasterInfo.description}
                        onChange={(e) => setDisasterInfo({ description: e.target.value })}
                    />
                </div>
            </Card>
            <Card className="p-[25px] border-[1px]">
                <h4 className="text-[24px] font-bold">Select Relevant Transactions</h4>
                {/*<ExpenseTable />*/}
            </Card>
            <Card className="p-[25px] border-[1px] flex flex-col gap-[10px]">
                <h4 className="text-[24px] font-bold">Upload additional documents</h4>
                <div className="flex flex-col gap-[16px]">
                    <Button className="w-fit h-fit rounded-full py-[12px] px-[20px]">
                        <Label>
                            <FaCircle size={24} color="white" />
                            <p>Upload from computer</p>
                        </Label>
                    </Button>
                    <Button className="w-fit h-fit rounded-full py-[12px] px-[20px]">
                        <Label>
                            <FaCircle size={24} color="white" />
                            <p>Select from business profile</p>
                        </Label>
                    </Button>
                </div>
            </Card>
            <div className="flex justify-end gap-1">
                <Button className="px-[20px] py-[12px] w-fit h-fit rounded-50 text-[16px]" onClick={handleStepBack}>
                    Back
                </Button>
                <Button
                    className="px-[20px] py-[12px] w-fit h-fit rounded-50 text-[16px] text-white bg-[#2e2f2d]"
                    onClick={handleProceed}
                >
                    Proceed to Personal Information
                </Button>
            </div>
        </div>
    );
}
