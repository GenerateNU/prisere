"use client";

import { Card } from "@/components/ui/card";
import BusinessCard from "./BusinessCard";
import LocationsCard from "./LocationsCard";
import InsuranceCard from "./InsuranceCard";

export default function Overview() {
    return (
        <div className="flex flex-col gap-[23px]">
            <BusinessCard />
            <Card className="p-[28px] flex gap-[12px]">
                <p className="font-bold text-[20px]">Locations</p>
                <LocationsCard />
            </Card>
            <Card className="p-[28px] flex gap-[12px]">
                <p className="font-bold text-[20px]">Insurance Information</p>
                <InsuranceCard />
            </Card>
        </div>
    );
}
