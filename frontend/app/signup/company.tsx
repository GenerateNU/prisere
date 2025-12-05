import { setCompanyMetadata } from "@/actions/auth";
import { createCompany } from "@/api/company";
import { createLocationBulk } from "@/api/location";
import LocationEditor from "@/components/LocationEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Company, CompanyTypesEnum, CreateCompanyRequest, businessTypes } from "@/types/company";
import { CreateLocationBulkRequest, CreateLocationRequest } from "@/types/location";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { IoAddCircleOutline } from "react-icons/io5";

interface CompanyInfoProps {
    handleNext: () => void;
}

export default function Company({ handleNext: incrementNext }: CompanyInfoProps) {
    const [companyError, setCompanyError] = useState<string | null>(null);
    const [locError, setLocError] = useState<string | null>(null);

    const [companyPayload, setCompanyPayload] = useState<CreateCompanyRequest>({
        name: "",
        businessOwnerFullName: "",
        companyType: "LLC",
        alternateEmail: "",
    });

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

    const { isPending: isLocationPending, mutate: mutateLocation } = useMutation({
        mutationFn: (payload: CreateLocationBulkRequest) => createLocationBulk(payload),
        onSuccess: () => {
            incrementNext();
        },
        onError: (_error: Error) => {
            const errorMessage = _error.message || "Error creating locations. Check required fields and try again";
            setLocError(errorMessage);
        },
    });

    const {
        isPending,
        error: companyMutateError,
        mutate,
    } = useMutation<Company, Error, CreateCompanyRequest>({
        mutationFn: (payload: CreateCompanyRequest) => createCompany(payload),
        onError: (error: Error) => {
            console.error("Error creating company:", error);
        },
        onSuccess: async (data: Company) => {
            await setCompanyMetadata(data.id);
            mutateLocation(locationPayloads);
        },
    });

    const locationInProgress = () =>
        locationPayloads.some((location) => {
            return (
                location.alias === "" ||
                location.streetAddress === "" ||
                location.city === "" ||
                location.stateProvince === "" ||
                location.postalCode === "" ||
                location.country === ""
            );
        });

    const handleAddLocation = () => {
        if (locationInProgress()) {
            setLocError("Please complete the current location before adding a new one.");
            return;
        }
        setLocError(null);
        addLocation();
    };

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
        if (locationInProgress()) {
            setLocError("Please complete all location fields.");
            return;
        }

        setEditingLocationIndex(null);
        setCompanyError(null);
        setLocError(null);
        mutate(companyPayload);
    };

    return (
        <Card className="w-full px-[163px] py-[127px]">
            <div className="flex justify-center w-[492px]">
                <label className="block text-[30px] text-black font-bold my-[30px]"> Business Information </label>
            </div>
            <div className="w-full flex flex-col items-center">
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
                        <Select
                            defaultValue={companyPayload.companyType}
                            onValueChange={(value: CompanyTypesEnum) => {
                                setCompanyPayload({ ...companyPayload, companyType: value });
                            }}
                        >
                            <SelectTrigger
                                id="businessType"
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
                <div className="flex flex-col gap-[8px] w-full mb-[30px]">
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
                <div className="flex flex-col gap-[8px] w-full mb-[30px]">
                    <Label htmlFor="owner" className="text-[16px]">
                        Secondary Email (Optional)
                    </Label>
                    <Input
                        id="owner"
                        name="owner"
                        type="text"
                        className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                        onChange={(e) => {
                            setCompanyPayload({ ...companyPayload, alternateEmail: e.target.value });
                        }}
                    />
                    <div className="text-xs text-gray-600">
                        FEMA disaster notifications will additionally be sent to this email.
                    </div>
                </div>

                {locationPayloads.map((location, index) => (
                    <LocationEditor
                        key={index}
                        location={location}
                        setLocation={(loc) => updateLocation(index, loc as CreateLocationRequest)}
                        removeLocation={() => removeLocation(index)}
                        isExpanded={editingLocationIndex === index}
                        onExpand={() =>
                            editingLocationIndex === index
                                ? setEditingLocationIndex(null)
                                : setEditingLocationIndex(index)
                        }
                        onCollapse={() => setEditingLocationIndex(null)}
                    />
                ))}
                <Button
                    className="w-[196px] flex items-center text-[16px] h-[34px] self-start px-[12px] py-[4px] underline bg-slate hover:bg-fuchsia hover:text-white"
                    onClick={handleAddLocation}
                >
                    <IoAddCircleOutline /> Add a location
                </Button>
            </div>
            <div className="w-full flex flex-col gap-2 items-center">
                {(locError || companyError || companyMutateError) && (
                    <p className="text-red-500 text-sm mt-[-16px]">
                        {companyError || locError || companyMutateError?.message}{" "}
                    </p>
                )}
                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isPending || isLocationPending}
                    className="max-h-[45px] w-fit bg-[var(--fuchsia)] text-white px-[20px] py-[12px] text-[16px] hover:bg-pink hover:text-fuchsia"
                >
                    {isPending || isLocationPending ? <Spinner /> : <></>}
                    Next
                </Button>
            </div>
        </Card>
    );
}
