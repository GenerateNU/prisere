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
    > | null
) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const {
        data: geoJsonCountyData,
        isLoading: isLoadingGeoJsonData,
        loadCountyData: loadGeoJson,
    } = useCountyLevelGEOJSONData();

    //On mount, force load the county data
    useEffect(() => {
        loadGeoJson();
    }, []);

    // Add a ref to store the GeoJSON layer
    const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

    useEffect(() => {
        console.log(JSON.stringify(femaRiskCountyLookup));
        if (
            !map ||
            !window.L ||
            !isMapReady ||
            isLoadingGeoJsonData ||
            !geoJsonCountyData ||
            femaRiskCountyLookup === null ||
            femaRiskCountyLookup.entries().reduce((acc, _) => acc + 1, 0) <= 0
        ) {
            setLoading(true);
            return;
        }

        try {
            // Clear existing GeoJSON layer if it exists
            if (geoJsonLayerRef.current) {
                map.removeLayer(geoJsonLayerRef.current);
            }

            // Create and store the new layer
            geoJsonLayerRef.current = window.L.geoJSON(geoJsonCountyData, {
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
        } catch (_err) {
            setLoading(false);
            setError(true);
        }
    }, [geoJsonCountyData, femaRiskCountyLookup, map]);

    return { loading, error };
};
