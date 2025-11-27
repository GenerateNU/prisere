import React, { useEffect, useRef, useState } from "react";
import { useLeafletMap } from "./hooks/useLeafletMap";
import { useGeoJSONLayers } from "./hooks/useGeoJSONLayers";
import { useLeafletLoader } from "./hooks/useLeafletLoader";
import { Spinner } from "@/components/ui/spinner";

interface LeafletGeoJSONMapProps {
    lat: number | undefined;
    long: number | undefined;
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
    >;
}

const LeafletGeoJSONMap = ({ lat, long, femaRiskCountyLookup}: LeafletGeoJSONMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const { isLoaded: leafletLoaded, error: leafletError } = useLeafletLoader();
    const [userLocation, setUserLocation] = useState<[number, number]>([lat || 0, long || 0]);
    const { map, isReady: mapReady, panTo } = useLeafletMap(mapRef, leafletLoaded, userLocation);
    useGeoJSONLayers(map, mapReady, femaRiskCountyLookup);

    // Pan to new location whenever lat or long changes
    useEffect(() => {
        if (mapReady && lat !== undefined && long !== undefined) {
            setUserLocation([lat, long]);
            panTo(lat, long);
        }
    }, [lat, long, mapReady, panTo]);

    const isLoading = !leafletLoaded || !mapReady;

    if (leafletError) {
        return <ErrorDisplay error={leafletError} />;
    }

    return (
        <div>
            {isLoading && (
                <div className="w-96 h-40 flex items-center justify-center rounded-xl">
                    <Spinner />
                </div>
            )}
            <div ref={mapRef} className="w-96 h-full rounded-xl z-0" />
        </div>
    );
};

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
    <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
            <div className="text-lg font-semibold text-red-700">Error: {error}</div>
        </div>
    </div>
);

export default LeafletGeoJSONMap;
