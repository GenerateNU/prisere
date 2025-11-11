"use server";
import NavBarCircle from "@/icons/NavBarCircle";
import DisasterStatusBanner from "@/components/dashboard/DisasterStatusBanner";
import { getDashboardBannerData } from "@/api/dashboard";
import RevenueAndExpenses from "@/components/dashboard/RevenueAndExpenses";
import NextSteps from "@/components/dashboard/NextSteps";
import NetDisasterExpense from "@/components/dashboard/NetDisasterExpenses";
import LocationRisk from "@/components/dashboard/LocationRisk";

export default async function Dashboard() {
  const bannerData = await getDashboardBannerData();
  
  return (
    <div className="bg-[#f5f5f5] flex flex-col gap-8 px-16 pt-16 pb-8 mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold">Dashboard</h2>
        <NavBarCircle size={43} />
      </div>
      
      {/* Banner - Full Width */}
      <div className="w-full">
        <DisasterStatusBanner bannerData={bannerData} />
      </div>
      
      {/* Two Column Grid for Revenue and Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Left Column - Revenue & Expenses */}
        <div className="w-full lg:col-span-4">
          <RevenueAndExpenses/>
        </div>
        
        {/* Right Column - Next Steps */}
        <div className="w-full lg:col-span-2">
          <NextSteps bannerData={bannerData} />
        </div>
      </div>

      {/* Two Column Grid for Location Based Risk and Net Disaster Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Left Column - Location Based Risk */}
        <div className="w-full lg:col-span-4">
          <LocationRisk />
        </div>
        
        {/* Right Column - Net Disaster Expense */}
        <div className="w-full lg:col-span-2">
          {bannerData.status === "has-claim" && (
            <NetDisasterExpense bannerData={bannerData} />
          )}
        </div>
      </div>
    </div>
  );
}