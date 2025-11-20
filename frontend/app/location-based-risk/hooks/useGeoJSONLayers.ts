import { useEffect, useRef } from "react";
import { useCountyLevelGEOJSONData } from "./useCountyLevelGEOJSONData";
import { useFEMARiskScore } from "./useFEMARiskScore";

/**
 * Hook to add GeoJSON layers to map
 */
export const useGeoJSONLayers = (map: any, isMapReady: boolean) => {
    const hasAddedLayersRef = useRef(false);

    const {
        data: geoJsonCountyData,
        isLoading: isLoadingGeoJsonData,
        error: errorsLoadingGeoJson,
        loadCountyData: loadGeoJson,
    } = useCountyLevelGEOJSONData();

    const { data: femaRiskScores, loading: isLoadingFemaData, countyLookup } = useFEMARiskScore();

    //On mount, force load the county data
    useEffect(() => {
        loadGeoJson();
    }, []);

    useEffect(() => {
        if (
            !map ||
            !window.L ||
            !isMapReady ||
            hasAddedLayersRef.current ||
            isLoadingGeoJsonData ||
            !geoJsonCountyData ||
            !femaRiskScores
        )
            return;

        try {
            window.L.geoJSON(geoJsonCountyData, {
                style: (feature: any) => ({
                    color: colorFromSevarity(
                        countyLookup.get(`${feature.properties.STATEFP}${feature.properties.COUNTYFP}`)?.riskRating
                    ),
                    fillColor: colorFromSevarity(
                        countyLookup.get(`${feature.properties.STATEFP}${feature.properties.COUNTYFP}`)?.riskRating
                    ),
                    fillOpacity: 0.7,
                    weight: 2,
                    opacity: 1,
                }),
                onEachFeature: (feature: any, layer: any) => {
                    if (feature.properties) {
                        layer.bindPopup(
                            `<b>${feature.properties.NAME}: ${countyLookup.get(`${feature.properties.STATEFP}${feature.properties.COUNTYFP}`)?.riskRating || "Unknown"}</b>`
                        );
                    }
                },
            }).addTo(map);

            hasAddedLayersRef.current = true;
        } catch (err) {
            console.error("Error adding GeoJSON layers:", err);
        }
    }, [geoJsonCountyData, femaRiskScores]);
};

function colorFromSevarity(value: string | undefined): string {
    if (!value) return "purple";

    switch (value?.toLowerCase()) {
        case "very high":
            return "#C7445D";
        case "relatively high":
            return "#E07069";
        case "relatively moderate":
            return "#F0D55D";
        case "relatively low":
            return "#509BC7";
        case "very low":
            return "#4D6DBD";
        case "no rating":
            return "white";
        case "not applicable":
            return "#CCCCCC";
        case "insufficient data":
            return "#858585";
        default:
            return "green";
    }
}
