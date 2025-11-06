import { setCompanyMetadata } from "@/actions/auth";
import { createCompany } from "@/api/company";
import { createLocationBulk } from "@/api/location";
import LocationEditor from "@/components/LocationEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Company, CreateCompanyRequest } from "@/types/company";
import { CreateLocationBulkRequest, CreateLocationRequest } from "@/types/location";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import AddCircle from "@/icons/AddCircle";

interface CompanyInfoProps {
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
}

export default function Company({ progress, setProgress }: CompanyInfoProps) {
    const [companyError, setCompanyError] = useState<string | null>(null);
    const [locError, setLocError] = useState<string | null>(null);
    const [step, setStep] = useState<number>(0);

    const [companyPayload, setCompanyPayload] = useState<CreateCompanyRequest>({
        name: "",
        businessOwnerFullName: "",
    }); // add businessType fields

    const businessTypes = ["LLC", "Sole Proprietorship", "Corporation", "Partnership"];
    const [locationPayloads, setLocationPayloads] = useState<CreateLocationBulkRequest>([
        {
            alias: "",
            streetAddress: "",
            city: "",
            stateProvince: "",
            postalCode: "",
            country: "",
        },
    ]);
    const [editingLocationIndex, setEditingLocationIndex] = useState<number | null>(0);

    const updateLocation = (index: number, location: CreateLocationRequest) => {
        const newLocations = [...locationPayloads];
        newLocations[index] = location;
        setLocationPayloads(newLocations);
    };

    const addLocation = () => {
        setLocationPayloads([
            ...locationPayloads,
            {
                alias: "",
                streetAddress: "",
                city: "",
                stateProvince: "",
                postalCode: "",
                country: "",
            },
        ]);
        setEditingLocationIndex(locationPayloads.length);
    };

    const removeLocation = (index: number) => {
        setLocationPayloads((prev) => prev.filter((_, i) => i !== index));
        setEditingLocationIndex(null);
    };

    const {
        isPending: isLocationPending,
        error: locationError,
        mutate: mutateLocation,
    } = useMutation({
        mutationFn: (payload: CreateLocationBulkRequest) => createLocationBulk(payload),
        onSuccess: () => {
            setProgress(progress + 1);
        },
        onError: (error: Error) => {
            console.error("Error creating locations:", error);
        },
    });

    const { isPending, error, mutate } = useMutation<Company, Error, CreateCompanyRequest>({
        mutationFn: (payload: CreateCompanyRequest) =>
            createCompany({ ...payload, businessOwnerFullName: "Owner Name" }),
        onError: (error: Error) => {
            console.error("Error creating company:", error);
        },
        onSuccess: async (data: Company) => {
            await setCompanyMetadata(data.id);
            mutateLocation(locationPayloads);
        },
    });

    const handleNext = () => {
        if (
            companyPayload.name === "" ||
            companyPayload.businessOwnerFullName === "" /* || companyPayload.businessType === "" */
        ) {
            setCompanyError("Please fill in all required fields.");
            return;
        }
        if (locationPayloads.length === 0) {
            setLocError("Please add at least one location.");
            return;
        }
        setEditingLocationIndex(null);
        setCompanyError(null);
        setLocError(null);
        mutate(companyPayload);
    };

    return (
        <Card className="w-full px-[163px] py-[127px]">
            <div className="flex justify-center">
                <label className="block text-[30px] text-black font-bold my-[30px]"> Business Information </label>
            </div>
            <div className="w-full flex flex-col items-center">
                {step === 0 && (
                    <>
                        <div className="w-full flex gap-[16px]">
                            <div className="flex flex-col gap-[8px] w-full">
                                <Label htmlFor="name" className="text-[16px]">
                                    Business Owner<span className="text-red-500 text-[16px]">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                    onChange={(e) =>
                                        setCompanyPayload({ ...companyPayload, businessOwnerFullName: e.target.value })
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-[8px] w-full pb-[16px]">
                                <Label htmlFor="businessType" className="text-[16px]">
                                    Business Type<span className="text-red-500 text-[16px]">*</span>
                                </Label>
                                <Select>
                                    <SelectTrigger
                                        id="businessType"
                                        //className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                        style={{
                                            height: "45px",
                                            width: "100%",
                                            padding: "16px 28px",
                                            fontSize: "16px",
                                            borderRadius: "10px",
                                            backgroundColor: "transparent",
                                        }}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {businessTypes.map((type) => (
                                            <SelectItem key={type} value={type} className="text-[16px]">
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {/*  add ^ onChange={(e) => setCompanyPayload({ ...companyPayload, businessType: e.target.value })} */}
                            </div>
                        </div>
                        <div className="flex flex-col gap-[8px] w-full mb-[16px]">
                            <Label htmlFor="owner" className="text-[16px]">
                                Business Name<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="owner"
                                name="owner"
                                type="text"
                                required
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                onChange={(e) => setCompanyPayload({ ...companyPayload, name: e.target.value })}
                            />
                        </div>
                    </>
                )}
                {step === 1 && (
                    <>
                        {locationPayloads.map((location, index) => (
                            <LocationEditor
                                key={index}
                                location={location}
                                setLocation={(loc) => updateLocation(index, loc)}
                                removeLocation={() => removeLocation(index)}
                                isExpanded={editingLocationIndex === index}
                                onExpand={() => setEditingLocationIndex(index)}
                                onCollapse={() => setEditingLocationIndex(null)}
                            />
                        ))}
                        <Button
                            variant="link"
                            className="w-fit flex items-center text-[16px] h-[24px] self-start p-0 underline hover:text-gray-600"
                            style={{ paddingInline: 0 }}
                            onClick={addLocation}
                        >
                            <AddCircle /> Add a location
                        </Button>
                    </>
                )}
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                <Button
                    type="button"
                    onClick={() => {
                        step == 0 ? setStep(1) : handleNext();
                    }}
                    disabled={isPending || isLocationPending}
                    className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white px-[20px] py-[12px] text-[16px]"
                >
                    {isPending || isLocationPending ? <Spinner /> : <></>}
                    Next
                </Button>
                {(locError || companyError) && <p className="text-red-500 text-sm"> {companyError || locError} </p>}
                {(error || locationError) && (
                    <p className="text-red-500 text-sm"> {error?.message || locationError?.message} </p>
                )}
            </div>
        </Card>
    );
}
