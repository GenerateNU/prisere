"use client";
import { companyHasData } from "@/api/company";
import { getDashboardBannerData } from "@/api/dashboard";
import { useQuery } from "@tanstack/react-query";
import DisasterStatusBanner from "./DisasterStatusBanner";
import LocationRisk from "./LocationRisk";
import NetDisasterExpense, { NetDisasterExpenseNoData } from "./NetDisasterExpenses";
import NextSteps from "./NextSteps";
import NoDataPopupWrapper from "./NoDataPopupWrapper";
import RevenueAndExpenses, { RevenueAndExpensesNoData } from "./RevenueAndExpenses";

export default function DashboardBody() {
    const { data: bannerData } = useQuery({
        queryKey: ["banner-data"],
        queryFn: getDashboardBannerData,
    });

    const { data: hasData, isPending: hasDataLoading } = useQuery({
        queryKey: ["company-has-data"],
        queryFn: companyHasData,
    });

    return (
        <div className="flex flex-col gap-8">
            {/* No Data Popup - only shows when hasData is false */}
            {!hasDataLoading && (
                <NoDataPopupWrapper hasData={(hasData?.hasExternalData || hasData?.hasFinancialData) ?? false} />
            )}

            {/* Banner - Full Width */}
            <div className="w-full">
                <DisasterStatusBanner bannerData={bannerData ?? { status: "no-disaster" }} />
            </div>

            {/* Two Column Grid for Revenue and Next Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* Left Column - Revenue & Expenses */}
                <div className="w-full lg:col-span-4 relative">
                    {hasData?.hasExternalData || hasData?.hasFinancialData ? (
                        <RevenueAndExpenses />
                    ) : (
                        <RevenueAndExpensesNoData />
                    )}
                </div>

                {/* Right Column - Next Steps */}
                <div className="w-full lg:col-span-2">
                    <NextSteps bannerData={bannerData ?? { status: "no-disaster" }} />
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
                    {bannerData?.status === "has-claim" &&
                        (hasData?.hasExternalData || hasData?.hasFinancialData ? (
                            <NetDisasterExpense bannerData={bannerData ?? { status: "no-disaster" }} />
                        ) : (
                            <NetDisasterExpenseNoData />
                        ))}
                </div>
            </div>
        </div>
    );
}
