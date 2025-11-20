"use client";
import LeafletGeoJSONMap from "@/app/location-based-risk/LocationBasedRiskCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

export default function LocationRisk() {
    return (
        <Card className="h-full p-[25px] border-[1px] border-black">
            <CardTitle className="text-[25px]">
                <div className="flex gap-2 items-center">
                    <p>Location Based Risk</p>
                    <div className="relative group">
                        <InfoIcon className="stroke-fuchsia cursor-help" />
                        <div className="absolute translate-y-2 bottom-full mb-2 hidden group-hover:block w-max max-w-xs bg-white text-sm rounded px-3 py-2 z-50">
                            This data is taken from FEMA's National Risk Map
                        </div>
                    </div>
                </div>
            </CardTitle>
            <CardContent className="px-0">
                <LeafletGeoJSONMap />
            </CardContent>
        </Card>
    );
}
