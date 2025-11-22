import { getCompanyLocations } from "@/api/company";
import { GetCompanyLocationsResponse } from "@/types/company";
import { useEffect, useState } from "react";

export const useSelectedLocation = () => {
    const [selectedLocation, setSelectedLocation] = useState<GetCompanyLocationsResponse[number] | undefined>();
    const [availableLocations, setAvailableLocations] = useState<GetCompanyLocationsResponse | null>(null);

    useEffect(() => {
        const fetchAndSaveLocations = async () => {
            const result = await getCompanyLocations();
            setAvailableLocations(result);
            setSelectedLocation(result[0]);
        };
        fetchAndSaveLocations();
    }, []);

    return { selectedLocation, availableLocations, setSelectedLocation };
};
