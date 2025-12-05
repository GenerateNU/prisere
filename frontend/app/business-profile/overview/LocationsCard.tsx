"use client";

import { getCompanyLocations } from "@/api/company";
import { createLocation, deleteLocation, updateLocationAddress } from "@/api/location";
import { useServerActionQuery } from "@/api/requestHandlers";
import LocationEditor from "@/components/LocationEditor";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CreateLocationRequest, Location, UpdateLocationRequest } from "@/types/location";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";

export default function LocationsCard({
    locationSelected,
    onLocationSelect,
}: {
    locationSelected?: Location["id"] | null;
    onLocationSelect?: (locationId: Location["id"]) => void;
}) {
    const [locationInfo, setLocationInfo] = useState<(CreateLocationRequest | UpdateLocationRequest)[]>([]);
    const [editingLocationIndex, setEditingLocationIndex] = useState<number | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { data: locationsQuery, isPending: locationPending } = useServerActionQuery({
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
                const errorMessage = error.message || "Error updating location. Check required fields and try again";
                setSaveError(errorMessage);
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
                const errorMessage = error.message || "Error creating location. Check required fields and try again";
                setSaveError(errorMessage);
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
            const errorMessage = _error.message || "Error removing location. Check required fields and try again";
            setSaveError(errorMessage);
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
        <Card className="p-[28px] flex gap-[12px] border-none shadow-none">
            <p className="font-bold text-[20px]">Locations</p>
            {locationPending ? (
                <Loading lines={2} />
            ) : (
                <div>
                    <div className="grid grid-cols-2 gap-x-[38px] gap-y-[16px]">
                        {locationInfo.map((location, index) => (
                            <div key={index}>
                                <LocationEditor
                                    location={location}
                                    isSelected={"id" in location && locationSelected === location.id}
                                    onClick={
                                        onLocationSelect && "id" in location
                                            ? () => onLocationSelect(location.id)
                                            : undefined
                                    }
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

                    <Button
                        className="hover:bg-fuchsia hover:text-white w-[196px] flex items-center text-[16px] h-[34px] self-start px-[12px] py-[4px] w-fit bg-slate"
                        onClick={addLocation}
                    >
                        <IoAddCircleOutline /> Add a location
                    </Button>
                </div>
            )}
        </Card>
    );
}
