"use client";
import NavBarCircle from "@/icons/NavBarCircle";
import RevenueAndExpenses from "@/components/dashboard/RevenueAndExpenses";
import NextSteps from "@/components/dashboard/NextSteps";
import LocationRisk from "@/components/dashboard/LocationRisk";
import NetDisasterExpenses from "@/components/dashboard/NetDisasterExpenses";
import DisasterStatusBanner from "@/components/dashboard/DisasterStatusBanner";

export default function Dashboard() {
    return (
        <div className={"flex flex-col gap-[32px] px-[70px] pt-[72px] mb-4 justify-center"}>
            <div className="flex justify-between items-center">
                <h2 className="text-[40px] font-bold">Dashboard</h2>
                <NavBarCircle size={43} />
            </div>
            <div>
                <DisasterStatusBanner/>
            </div>
        </div>
    );
}
