"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { HazardIndexOverviewCard, RiskIndexOverviewCard } from "../../app/location-based-risk/RiskIndexOverviewCard";
import { useSelectedLocation } from "@/app/location-based-risk/hooks/useSelectedLocation";
import { LocationsDropDown } from "./locationsDropDown";
import { useFEMARiskScore } from "@/app/location-based-risk/hooks/useFEMARiskScore";
import { useLeafletMap } from "@/app/location-based-risk/hooks/useLeafletMap";
import { useGeoJSONLayers } from "@/app/location-based-risk/hooks/useGeoJSONLayers";
import { useLeafletLoader } from "@/app/location-based-risk/hooks/useLeafletLoader";
import { LargeLoading } from "../loading";
import ErrorDisplay from "../ErrorDisplay";

export default function LocationRisk() {
    const { availableLocations, selectedLocation, setSelectedLocation } = useSelectedLocation();
    const { countyLookup: femaRiskCountyLookup, lastUpdated } = useFEMARiskScore();

    const mapRef = useRef<HTMLDivElement>(null);
    const { isLoaded: leafletLoaded, error: leafletError } = useLeafletLoader();
    const [userLocation, setUserLocation] = useState<[number, number]>([
        selectedLocation?.lat || 0,
        selectedLocation?.long || 0,
    ]);
    const { map, isReady: mapReady, panTo, error: mapError } = useLeafletMap(mapRef, leafletLoaded, userLocation);
    const { loading: geoJsonLoading, error: geoJsonError } = useGeoJSONLayers(map, mapReady, femaRiskCountyLookup);

    // Pan to new location whenever selectedLocation changes
    useEffect(() => {
        if (mapReady && selectedLocation?.lat !== undefined && selectedLocation?.long !== undefined) {
            setUserLocation([selectedLocation.lat, selectedLocation.long]);
            panTo(selectedLocation.lat, selectedLocation.long);
        }
    }, [selectedLocation?.lat, selectedLocation?.long, mapReady, panTo]);

    const isLoading = !leafletLoaded || !mapReady || geoJsonLoading;

    const error = leafletError || mapError || geoJsonError;

    useEffect(() => {
        if (map && !isLoading && mapReady) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [isLoading, map, mapReady]);

    return (
        <Card className="h-full p-[25px] border-[1px]">
            <CardTitle className="text-[25px]">
                <div className="flex gap-2 -top-2 items-center justify-between">
                    <div className="flex flex-row gap-2 items-center">
                        <p>Location Based Risk</p>
                        <div className="relative group">
                            <InfoIcon className={"stroke-neutral-400 hover:stroke-fuchsia"} />
                            <div className="absolute hidden group-hover:block w-max max-w-xs bg-white font-thin text-sm rounded px-3 py-2 z-50">
                                {"This data is taken from FEMA's National Risk Map"}
                            </div>
                        </div>
                    </div>
                    <LocationsDropDown
                        availableLocations={availableLocations || []}
                        selectedLocation={selectedLocation}
                        handleSelect={(loc) => setSelectedLocation(loc)}
                    />
                </div>
            </CardTitle>
            <div className="relative">
                {(isLoading || femaRiskCountyLookup === null) && (
                    <CardContent
                        className={`h-[550px] w-full flex items-center justify-center bg-white border-none shadow-none p-0`}
                    >
                        {error ? <ErrorDisplay /> : <LargeLoading />}
                    </CardContent>
                )}

                {femaRiskCountyLookup !== null && (
                    <CardContent className={`w-[100%] flex flex-row px-0 ${isLoading && "hidden"}`}>
                        <div className="w-[100%] flex flex-col">
                            <div className="w-[100%] flex flex-row">
                                <div>
                                    <div ref={mapRef} className="w-96 h-full rounded-xl z-0" />
                                </div>
                                <div className="w-full pl-4 flex flex-col gap-2">
                                    <RiskIndexOverviewCard
                                        riskAttributes={femaRiskCountyLookup.get(
                                            `${selectedLocation?.fipsStateCode.toString().padStart(2, "0")}${selectedLocation?.fipsCountyCode.toString().padStart(3, "0")}`
                                        )}
                                        loading={isLoading}
                                    />
                                    <HazardIndexOverviewCard
                                        riskAttributes={femaRiskCountyLookup.get(
                                            `${selectedLocation?.fipsStateCode.toString().padStart(2, "0")}${selectedLocation?.fipsCountyCode.toString().padStart(3, "0")}`
                                        )}
                                        loading={isLoading}
                                    />
                                </div>
                            </div>
                            {lastUpdated && (
                                <p className="text-sm text-gray-600 italic">
                                    This data was last updated{" "}
                                    {lastUpdated.toLocaleString("en-US", {
                                        timeZone: "America/New_York",
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </p>
                            )}
                        </div>
                    </CardContent>
                )}
            </div>
        </Card>
    );
}
