import { useEffect, useRef } from "react";
import { useCountyLevelGEOJSONData } from "./useCountyLevelGEOJSONData";
import type { Map as LeafletMap } from "leaflet";

/**
 * Hook to add GeoJSON layers to map
 */
export const useGeoJSONLayers = (
    map: LeafletMap,
    isMapReady: boolean,
    femaRiskCountyLookup: Map<
        string,
        {
            countyFipsCode: string;
            riskRating: string;
            ealRating: string;
            socialVuln: string;
            communityResilience: string;
            coastalFlooding: string;
            drought: string;
            wildFire: string;
        }
    >
) => {
    const hasAddedLayersRef = useRef(false);

    const {
        data: geoJsonCountyData,
        isLoading: isLoadingGeoJsonData,
        loadCountyData: loadGeoJson,
    } = useCountyLevelGEOJSONData();

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
            !femaRiskCountyLookup
        )
            return;

        try {
            window.L.geoJSON(geoJsonCountyData, {
                style: (feature) => ({
                    color: colorFromSevarity(
                        femaRiskCountyLookup.get(`${feature?.properties.STATEFP}${feature?.properties.COUNTYFP}`)
                            ?.riskRating
                    ),
                    fillColor: colorFromSevarity(
                        femaRiskCountyLookup.get(`${feature?.properties.STATEFP}${feature?.properties.COUNTYFP}`)
                            ?.riskRating
                    ),
                    fillOpacity: 0.7,
                    weight: 2,
                    opacity: 1,
                }),
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        layer.bindPopup(
                            `<b>${feature.properties.NAME}: ${femaRiskCountyLookup.get(`${feature.properties.STATEFP}${feature.properties.COUNTYFP}`)?.riskRating || "Unknown"}</b>`
                        );
                    }
                },
            }).addTo(map);

            hasAddedLayersRef.current = true;
        } catch (err) {
            console.error("Error adding GeoJSON layers:", err);
        }
    }, [geoJsonCountyData, femaRiskCountyLookup, map]);
};

function colorFromSevarity(value: string | undefined): string {
    if (!value) return "purple";

    switch (value?.toLowerCase()) {
        case "very high":
            return "var(--fuchsia)";
        case "relatively high":
            return "var(--fuchsia)";
        case "relatively moderate":
            return "var(--gold)";
        case "relatively low":
            return "var(--teal)";
        case "very low":
            return "var(--teal)";
        case "no rating":
            return "var(--slate)";
        case "not applicable":
            return "var(--slate)";
        case "insufficient data":
            return "var(--slate)";
        default:
            return "green";
    }
}
