"use client";
import NavBarCircle from "@/icons/NavBarCircle";
import RevenueAndExpenses from "../../components/RevenueAndExpenses";
import NextSteps from "../../components/NextSteps";
import LocationRisk from "../../components/LocationRisk";
import NetDisasterExpenses from "../../components/NetDisasterExpenses";

export default function Dashboard() {
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
