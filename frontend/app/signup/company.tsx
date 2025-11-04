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
import { is } from "date-fns/locale";
import { Spinner } from "@/components/ui/spinner";

interface CompanyInfoProps {
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
}

export default function Company({ progress, setProgress }: CompanyInfoProps) {
    const [companyError, setCompanyError] = useState<string | null>(null);
    const [locError, setLocError] = useState<string | null>(null);

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
        <div className="max-w-lg w-full space-y-[30px]">
            <div className="flex justify-center">
                <label className="block text-[30px] text-black font-bold my-[30px]"> Business Information </label>
            </div>
            <div className="w-full flex flex-col items-center space-y-[16px]">
                <div className="flex flex-col gap-[16px] w-full">
                    <Label htmlFor="name" className="text-[20px]">
                        Business Name<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="h-[85px]"
                        onChange={(e) => setCompanyPayload({ ...companyPayload, name: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-[16px] w-full">
                    <Label htmlFor="owner" className="text-[20px]">
                        Business Owner<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Input
                        id="owner"
                        name="owner"
                        type="text"
                        required
                        className="h-[85px]"
                        onChange={(e) =>
                            setCompanyPayload({ ...companyPayload, businessOwnerFullName: e.target.value })
                        }
                    />
                </div>
                <div className="flex flex-col gap-[16px] w-full  pb-[16px]">
                    <Label htmlFor="businessType" className="text-[20px]">
                        Business Type<span className="text-red-500 text-[20px]">*</span>
                    </Label>
                    <Select>
                        <SelectTrigger
                            id="businessType"
                            className="w-full rounded-full text-[16px] bg-stone-100"
                            style={{ height: "85px" }}
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
                    className="w-fit h-fit self-start px-0 font-bold underline hover:text-gray-600"
                    onClick={addLocation}
                >
                    + Add a location
                </Button>
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isPending || isLocationPending}
                    className="bg-[var(--teal)] text-white"
                >
                    {isPending || isLocationPending ? <Spinner /> : <></>}
                    Next
                </Button>
                {(locError || companyError) && (
                    <p className="text-red-500 text-sm"> {companyError || locError} </p>
                )}
                {(error || locationError) && <p> {error?.message || locationError?.message} </p>}
            </div>
        </div>
    );
}
