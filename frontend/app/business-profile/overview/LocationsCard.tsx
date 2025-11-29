"use client";

import { getCompanyLocations } from "@/api/company";
import { createLocation, deleteLocation, updateLocationAddress } from "@/api/location";
import LocationEditor from "@/components/LocationEditor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CreateLocationRequest, UpdateLocationRequest } from "@/types/location";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { IoAddCircleOutline } from "react-icons/io5";

export default function LocationsCard() {
    const [locationInfo, setLocationInfo] = useState<(CreateLocationRequest | UpdateLocationRequest)[]>([]);
    const [editingLocationIndex, setEditingLocationIndex] = useState<number | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { data: locationsQuery, isPending: businessPending } = useQuery({
        queryKey: ["locations"],
        queryFn: getCompanyLocations,
    });

    const { mutate: updateLocationsMutate } = useMutation({
        mutationFn: (location: UpdateLocationRequest) => updateLocationAddress(location),
        onSuccess: () => {
            setSaveError(null);
            setEditingLocationIndex(null);
        },
        onError: (error: Error) => {
            if (error.message.includes("postalCode")) {
                setSaveError("Error updating location. Please check postal code details and try again.");
            } else {
                setSaveError("An error occurred while saving the location.");
            }
        },
    });

    const { mutate: createLocationMutate } = useMutation({
        mutationFn: (location: CreateLocationRequest) => createLocation(location),
        onSuccess: () => {
            setSaveError(null);
            setEditingLocationIndex(null);
        },
        onError: (error: Error) => {
            if (error.message.includes("postalCode")) {
                setSaveError("Error creating location. Please check postal code details and try again.");
            } else {
                setSaveError("An error occurred while creating the location.");
            }
        },
    });

    const { mutate: deleteLocationMutate } = useMutation({
        mutationFn: (locationId: string) => deleteLocation(locationId),
        onSuccess: () => {
            setSaveError(null);
            setEditingLocationIndex(null);
        },
        onError: (_error: Error) => {
            setSaveError("An error occurred while deleting the location.");
        },
    });

    const updateLocation = (index: number, location: CreateLocationRequest | UpdateLocationRequest) => {
        const newLocations = [...locationInfo];
        newLocations[index] = location;
        setLocationInfo(newLocations);
    };

    const removeLocation = (index: number) => {
        const location = locationInfo[index];

        if ("id" in location && location.id) {
            deleteLocationMutate(location.id);
        }

        setLocationInfo((prev) => prev.filter((_, i) => i !== index));
        setEditingLocationIndex(null);
    };

    const addLocation = () => {
        setLocationInfo([
            ...locationInfo,
            {
                alias: "",
                streetAddress: "",
                city: "",
                stateProvince: "",
                postalCode: "",
                country: "",
            },
        ]);
        setEditingLocationIndex(locationInfo.length);
    };

    const handleSave = () => {
        console.log("HITTING HERE");
        if (editingLocationIndex === null) return;

        const location = locationInfo[editingLocationIndex];

        if (
            !location.alias ||
            !location.streetAddress ||
            !location.city ||
            !location.stateProvince ||
            !location.postalCode ||
            !location.country
        ) {
            setSaveError("Please fill in all required fields before saving.");
            return;
        }

        if ("id" in location) {
            updateLocationsMutate(location as UpdateLocationRequest);
        } else {
            createLocationMutate(location as CreateLocationRequest);
        }
    };

    useEffect(() => {
        if (locationsQuery) {
            setLocationInfo(locationsQuery);
        }
    }, [locationsQuery]);

    return (
        <div>
            {businessPending ? (
                <Spinner className="mb-[16px]" />
            ) : (
                <div className="grid grid-cols-2 gap-x-[38px] gap-y-[16px]">
                    {locationInfo.map((location, index) => (
                        <div key={index}>
                            <LocationEditor
                                location={location}
                                setLocation={(loc) => updateLocation(index, loc)}
                                removeLocation={() => removeLocation(index)}
                                isExpanded={editingLocationIndex === index}
                                onExpand={() =>
                                    editingLocationIndex === index
                                        ? setEditingLocationIndex(null)
                                        : setEditingLocationIndex(index)
                                }
                                onCollapse={() => handleSave()}
                                saveError={saveError}
                            />
                        </div>
                    ))}
                </div>
            )}
            <Button
                className="w-[196px] flex items-center text-[16px] h-[34px] self-start px-[12px] py-[4px] underline bg-slate hover:text-gray-600"
                onClick={addLocation}
            >
                <IoAddCircleOutline /> Add a location
            </Button>
        </div>
    );
}
