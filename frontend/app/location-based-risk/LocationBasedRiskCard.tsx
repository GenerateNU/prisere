import React, { useEffect, useRef, useState } from "react";
import { useLeafletMap } from "./hooks/useLeafletMap";
import { useGeoJSONLayers } from "./hooks/useGeoJSONLayers";
import { useLeafletLoader } from "./hooks/useLeafletLoader";
import { useUserLocation } from "./hooks/useUserLocation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { getFemaRiskIndexData, refreshFemaRiskIndexData } from "@/api/fema-risk-index";

const LeafletGeoJSONMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const { isLoaded: leafletLoaded, error: leafletError } = useLeafletLoader();
    const [userLocation, setUserLocation] = useState<[number, number]>([42.3398, -71.0892]);
    const { error, getLocation, loading, location } = useUserLocation();
    const { map, isReady: mapReady } = useLeafletMap(mapRef, leafletLoaded, userLocation);
    useGeoJSONLayers(map, mapReady);

    //on mount request the user's location
    // useEffect(() => {
    //     getLocation();
    // }, []);

    useEffect(() => {
        if (location) {
            setUserLocation([location.coords.latitude, location.coords.longitude]);
        }
    }, [location]);

    const isLoading = !leafletLoaded || !mapReady;

    if (leafletError) {
        return <ErrorDisplay error={leafletError} />;
    }

    return (
        <div>
            {isLoading && (
                <div className="w-96 h-96 flex items-center justify-center rounded-xl">
                    <Spinner />
                </div>
            )}
            <div ref={mapRef} className="w-96 h-96 rounded-xl" />
        </div>
    );
};

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[2000]">
        <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">{message}</div>
        </div>
    </div>
);

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
    <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
            <div className="text-lg font-semibold text-red-700">Error: {error}</div>
        </div>
    </div>
);

export default LeafletGeoJSONMap;
