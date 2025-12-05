"use client";
import { companyHasData } from "@/api/company";
import LocationsCard from "@/app/business-profile/overview/LocationsCard";
import ExpenseTable from "@/app/expense-tracker/expense-table/expense-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GetCompanyLocationsResponse } from "@/types/company";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { validateDisasterInfo } from "./utils/validationUtils";
import { CloudCheck, UploadIcon } from "lucide-react";
import { useModal } from "@/components/ui/modal/useModal";
import { Modal } from "@/components/ui/modal/Modal";
import { UploadDocument } from "./UploadDocument";
import { DisasterInfo } from "@/types/claim";

type DisasterInfoStepProps = {
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
}: DisasterInfoStepProps) {
    const { openModal: openUploadModal, isOpen: isUploadModalOpen, closeModal: closeUploadModal } = useModal({});

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
                    <LocationsCard
                        onLocationSelect={(locationId) =>
                            disasterInfo.location === locationId
                                ? setDisasterInfo({ location: undefined })
                                : setDisasterInfo({ location: locationId })
                        }
                        locationSelected={disasterInfo.location}
                    />

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
                        className="group bg-slate hover:bg-fuchsia hover:text-white w-fit h-fit rounded-full py-[12px] px-[20px]"
                        onClick={openUploadModal}
                    >
                        <Label>
                            <UploadIcon size={24} className="text-black group-hover:text-white" />
                            <p>Upload from your computer</p>
                        </Label>
                    </Button>
                    <div className="pl-3">
                        {disasterInfo.additionalDocuments.map((element, idx) => (
                            <div key={idx} className="p-1">
                                <div className="bg-gray-100 flex flex-row items-center rounded-full w-fit px-2 py-0">
                                    <CloudCheck size={28} className="pl-2" />
                                    <p className="text-sm p-3">{element.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
            <div className="flex items-center justify-end gap-3 w-full">
                <Button
                    onClick={handleStepBack}
                    className="text-sm bg-light-fuchsia text-fuchsia hover:bg-fuchsia hover:text-white w-[70px]"
                    size="lg"
                >
                    Back
                </Button>
                <Button
                    size="lg"
                    onClick={handleProceed}
                    className="bg-fuchsia text-white px-[20px] py-[12px] w-[230px] h-[42px] text-[14px] rounded-50 hover:bg-pink hover:text-fuchsia"
                >
                    Proceed to Personal Information
                </Button>
            </div>
            <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal}>
                <UploadDocument
                    handleUploadFiles={(files: File[]) => {
                        closeUploadModal();
                        setDisasterInfo({ additionalDocuments: files });
                    }}
                    selectedFiles={disasterInfo.additionalDocuments}
                />
            </Modal>
        </div>
    );
}
