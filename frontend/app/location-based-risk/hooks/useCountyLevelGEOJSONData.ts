import { useState } from "react";
import { GeoJsonObject } from "geojson";

export const useCountyLevelGEOJSONData = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<GeoJsonObject[]>();
    const [error, setError] = useState<string | undefined>();

    const loadCountyData = async () => {
        setIsLoading(true);
        setError(undefined);

        try {
            const response = await fetch("/counties.geojson");

            if (!response.ok) {
                throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
            }

            const geojsonData = await response.json();

            // Validate that it's proper GeoJSON
            if (!geojsonData.type || !geojsonData.features) {
                throw new Error("Invalid GeoJSON format");
            }

            console.log(geojsonData.features);
            setData(geojsonData); // Store the entire FeatureCollection, not just features
            return geojsonData;
        } catch (err) {
            setError(JSON.stringify(err));
            console.error("Error loading county GeoJSON:", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        data,
        isLoading,
        error,
        loadCountyData,
    };
};
