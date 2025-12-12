import { getCompanyLocations } from "@/api/company";
import { GetCompanyLocationsResponse } from "@/types/company";
import { useEffect, useState } from "react";
import { isServerActionSuccess } from "@/api/types";

export const useSelectedLocation = () => {
    const [selectedLocation, setSelectedLocation] = useState<GetCompanyLocationsResponse[number] | undefined>();
    const [availableLocations, setAvailableLocations] = useState<GetCompanyLocationsResponse | null>(null);

    useEffect(() => {
        const fetchAndSaveLocations = async () => {
            const result = await getCompanyLocations();
            if (isServerActionSuccess(result)) {
                setAvailableLocations(result.data);
                setSelectedLocation(result.data[0]);
            } else {
                console.error(result.error);
            }
        };
        fetchAndSaveLocations();
    }, []);

    return { selectedLocation, availableLocations, setSelectedLocation };
};
