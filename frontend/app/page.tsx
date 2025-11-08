"use client";
import NavBarCircle from "@/icons/NavBarCircle";
import RevenueAndExpenses from "@/components/dashboard/RevenueAndExpenses";
import NextSteps from "@/components/dashboard/NextSteps";
import LocationRisk from "@/components/dashboard/LocationRisk";
import NetDisasterExpenses from "@/components/dashboard/NetDisasterExpenses";
import { importQuickbooksData } from "@/api/quickbooks";
import { useEffect } from "react";

export default function Dashboard() {
    useEffect(() => {
        importQuickbooksData();
    }, []);

    return (
        <div className={"flex flex-col gap-[32px] px-[70px] pt-[72px] mb-4 justify-center"}>
            <div className="flex justify-between items-center">
                <h2 className="text-[40px] font-bold">Dashboard</h2>
                <NavBarCircle size={43} />
            </div>
            <div className="flex gap-[28px]">
                <div className="basis-2/3">
                    <RevenueAndExpenses />
                </div>
                <div className="basis-1/3">
                    <NextSteps />
                </div>
            </div>
            <div className="flex gap-[28px]">
                <div className="flex-2/5">
                    <LocationRisk />
                </div>
                <div className="flex-3/5">
                    <NetDisasterExpenses />
                </div>
            </div>
        </div>
    );
}
