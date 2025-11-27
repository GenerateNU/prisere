"use client";
import LeafletGeoJSONMap from "@/app/location-based-risk/LocationBasedRiskCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { HazardIndexOverviewCard, RiskIndexOverviewCard } from "../../app/location-based-risk/RiskIndexOverviewCard";
import { useSelectedLocation } from "@/app/location-based-risk/hooks/useSelectedLocation";
import { LocationsDropDown } from "./locationsDropDown";
import { useFEMARiskScore } from "@/app/location-based-risk/hooks/useFEMARiskScore";

export default function LocationRisk() {
    const { availableLocations, selectedLocation, setSelectedLocation } = useSelectedLocation();
    const { countyLookup: femaRiskCountyLookup, lastUpdated } = useFEMARiskScore();

    return (
        <Card className="h-full p-[25px] border-[1px]">
            <CardTitle className="text-[25px]">
                <div className="flex gap-2 -top-2 items-center justify-between">
                    <div className="flex flex-row gap-2 items-center">
                        <p>Location Based Risk</p>
                        <div className="relative group">
                            <InfoIcon className="stroke-fuchsia" />
                            <div className="absolute hidden group-hover:block w-max max-w-xs bg-white font-thin text-sm rounded px-3 py-2 z-50">
                                {"This data is taken from FEMA\'s National Risk Map"}
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
            <CardContent className="w-[100%] flex flex-row px-0">
                <div className="w-[100%] flex flex-col">
                    <div className="w-[100%] flex flex-row">
                        <LeafletGeoJSONMap
                            lat={selectedLocation?.lat}
                            long={selectedLocation?.long}
                            femaRiskCountyLookup={femaRiskCountyLookup}
                        />
                        <div className="w-full pl-4 flex flex-col gap-2">
                            <RiskIndexOverviewCard
                                riskAttributes={femaRiskCountyLookup.get(
                                    `${selectedLocation?.fipsStateCode.toString().padStart(2, "0")}${selectedLocation?.fipsCountyCode.toString().padStart(3, "0")}`
                                )}
                            />
                            <HazardIndexOverviewCard
                                riskAttributes={femaRiskCountyLookup.get(
                                    `${selectedLocation?.fipsStateCode.toString().padStart(2, "0")}${selectedLocation?.fipsCountyCode.toString().padStart(3, "0")}`
                                )}
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
        </Card>
    );
}
