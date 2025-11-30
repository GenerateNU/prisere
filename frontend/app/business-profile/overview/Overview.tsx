"use client";
import BusinessCard from "./BusinessCard";
import LocationsCard from "./LocationsCard";
import InsuranceCard from "./InsuranceCard";

export default function Overview() {
    return (
        <div className="flex flex-col gap-[23px]">
            <BusinessCard />
            <LocationsCard />
            <InsuranceCard />
        </div>
    );
}
