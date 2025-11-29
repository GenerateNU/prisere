import { useEffect, useRef, useState } from "react";
import { useCountyLevelGEOJSONData } from "./useCountyLevelGEOJSONData";
import type { Map as LeafletMap } from "leaflet";
import { colorFromSevarity } from "./colorFromSeverityLevel";

/**
 * Hook to add GeoJSON layers to map
 */
export const useGeoJSONLayers = (
    map: LeafletMap | null,
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

    const [loading, setLoading] = useState(true);
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
            isLoadingGeoJsonData ||
            !geoJsonCountyData ||
            !femaRiskCountyLookup
        ) {
            setLoading(true);
            return;
        }
        if (
            hasAddedLayersRef.current
        ) {
            return;
        }
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
            setLoading(false);
            hasAddedLayersRef.current = true;
        } catch (err) {
            setLoading(false);
            console.error("Error adding GeoJSON layers:", err);
        }
    }, [geoJsonCountyData, femaRiskCountyLookup, map]);

    return {loading}
};
