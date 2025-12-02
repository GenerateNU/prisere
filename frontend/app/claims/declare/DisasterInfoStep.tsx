"use client";
import { companyHasData } from "@/api/company";
import ExpenseTable from "@/app/expense-tracker/expense-table/expense-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProfileIcon } from "@/icons/profile";
import { UploadIcon } from "@/icons/upload";
import { cn } from "@/lib/utils";
import { DisasterInfo } from "@/types/claim";
import { GetCompanyLocationsResponse } from "@/types/company";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { validateDisasterInfo } from "./utils/validationUtils";

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
    const { data: hasData } = useQuery({
        queryKey: ["company-has-data"],
        queryFn: companyHasData,
    });

    const [errors, setErrors] = React.useState<Partial<Record<keyof DisasterInfo, string>>>({});

    const validateForm = () => validateDisasterInfo(disasterInfo, setErrors);

    const handleProceed = () => {
        if (validateForm()) {
            handleStepForward(disasterInfo);
        }
    };

    return (
        <div className="flex flex-col gap-[40px]">
            <h3 className="text-[25px] font-bold">Disaster Specific Information</h3>
            <Card className="p-[25px] border-none shadow-none">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="disaster-name">
                        Name of the disaster <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                        id="disaster-name"
                        className="h-10 bg-white shadow-none rounded-[10px]"
                        value={disasterInfo.name ?? ""}
                        onChange={(e) => setDisasterInfo({ name: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label>
                        Is this disaster tied to a FEMA disaster? <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                        onValueChange={(value) => setDisasterInfo({ isFema: value === "yes" })}
                        value={disasterInfo.isFema ? "yes" : "no"}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* TODO: have the select options be actual disasters that happened in time frame? */}
                {disasterInfo.isFema && (
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="fema-disaster-id">FEMA Disaster ID</Label>
                        <Input
                            id="fema-disaster-id"
                            className="h-10 bg-white shadow-none rounded-[10px]"
                            value={disasterInfo.femaDisasterId ?? ""}
                            onChange={(e) => setDisasterInfo({ femaDisasterId: e.target.value })}
                        />
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">
                        Location of incident {(locations?.length ?? 0) > 1 ? "(choose one)" : null}{" "}
                        <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        {locations?.map((l) => {
                            return (
                                <Card
                                    key={l.id}
                                    className={cn(
                                        "py-5 px-7 cursor-pointer border-transparent hover:border-fuchsia border-2 transition-all duration-150",
                                        disasterInfo.location === l.id && "border-fuchsia"
                                    )}
                                    onClick={() =>
                                        setDisasterInfo({ location: disasterInfo.location === l.id ? undefined : l.id })
                                    }
                                >
                                    <div>{l.alias} </div>
                                    <div className="h-px bg-[#DBDBDB] w-full" />
                                    <div className="flex flex-col">
                                        <span>{l.streetAddress}</span>
                                        <span>
                                            {l.city}, {l.stateProvince} {l.postalCode}
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">Description of the incident</Label>
                    <Textarea
                        className="min-h-64 text-[16px]"
                        rows={5}
                        placeholder="Begin typing"
                        value={disasterInfo.description}
                        onChange={(e) => setDisasterInfo({ description: e.target.value })}
                    />
                </div>
            </Card>
            <ExpenseTable
                title="Select Relevant Transactions"
                hasData={(hasData?.hasExternalData || hasData?.hasFinancialData) ?? false}
                rowOption={"collapsible"}
                editableTags={true}
                setSelections={(selections) => setDisasterInfo({ purchaseSelections: selections })}
                selections={disasterInfo.purchaseSelections}
            />
            <Card className="p-[25px] flex flex-col gap-[10px] border-none shadow-none">
                <h4 className="text-[24px] font-bold">Upload additional documents</h4>
                <div className="flex flex-col gap-[16px]">
                    <Button
                        size="sm"
                        className="h-[34px] px-2 justify-between gap-2 rounded-full bg-muted text-black text-sm hover:bg-muted/80 aria-expanded:border w-fit"
                    >
                        <div className="flex items-center gap-2">
                            <UploadIcon className="size-6" />
                            <span className="truncate">Upload from computer</span>
                        </div>
                    </Button>
                    <Button
                        size="sm"
                        className="h-[34px] px-2 justify-between gap-2 rounded-full bg-muted text-black text-sm hover:bg-muted/80 aria-expanded:border w-fit"
                    >
                        <div className="flex items-center gap-2">
                            <ProfileIcon className="size-6" />
                            <span className="truncate">Select from business profile</span>
                        </div>
                    </Button>
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
                    Proceed to Personal Information
                </Button>
            </div>
        </div>
    );
}
