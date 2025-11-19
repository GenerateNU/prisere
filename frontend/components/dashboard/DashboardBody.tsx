"use server";
import DisasterStatusBanner from "./DisasterStatusBanner";
import { getDashboardBannerData } from "@/api/dashboard";
import RevenueAndExpenses, { RevenueAndExpensesNoData } from "./RevenueAndExpenses";
import NextSteps from "./NextSteps";
import NetDisasterExpense, { NetDisasterExpenseNoData } from "./NetDisasterExpenses";
import LocationRisk from "./LocationRisk";
import { companyHasData } from "@/api/company";
import NoDataPopupWrapper from "./NoDataPopupWrapper";

export default async function DashboardBody() {
    const bannerData = await getDashboardBannerData();
    const hasData = await companyHasData();
    return (
        <div className="flex flex-col gap-8">
            {/* No Data Popup - only shows when hasData is false */}
            <NoDataPopupWrapper hasData={hasData} />

            {/* Banner - Full Width */}
            <div className="w-full">
                <DisasterStatusBanner bannerData={bannerData} />
            </div>

            {/* Two Column Grid for Revenue and Next Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* Left Column - Revenue & Expenses */}
                <div className="w-full lg:col-span-4 relative">
                    {hasData ? <RevenueAndExpenses /> : <RevenueAndExpensesNoData />}
                </div>

                {/* Right Column - Next Steps */}
                <div className="w-full lg:col-span-2">
                    <NextSteps bannerData={bannerData} />
                </div>
            </div>

            {/* Two Column Grid for Location Based Risk and Net Disaster Expense */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* Left Column - Location Based Risk */}
                <div className="w-full lg:col-span-4 relative">
                    <LocationRisk />
                </div>

                {/* Right Column - Net Disaster Expense */}
                <div className="w-full lg:col-span-2">
                    {bannerData.status === "has-claim" &&
                        (hasData ? <NetDisasterExpense bannerData={bannerData} /> : <NetDisasterExpenseNoData />)}
                </div>
            </div>
        </div>
    );
}
