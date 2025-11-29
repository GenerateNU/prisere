"use client";
import { getPurchaseLineItemsFromClaim } from "@/api/claim";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BannerData } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BiMessageEdit } from "react-icons/bi";

type Props = {
    bannerData: BannerData;
    onDashboard?: boolean;
    handleSwitchToReview?: () => void;
};

// No Data Component
export function NetDisasterExpenseNoData() {
    return (
        <Card className="w-full h-full flex flex-col max-w-xl p-[24px]">
            <div className="flex items-center justify-between">
                <div className="">
                    <h2 className="text-[24px] text-nowrap font-bold">Net Disaster Expenses</h2>
                </div>
            </div>
            <CardContent className="p-0 flex flex-1 flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-fuchsia rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path
                            d="M16 8v8m0 4h.01M28 16c0 6.627-5.373 12-12 12S4 22.627 4 16 9.373 4 16 4s12 5.373 12 12z"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-bold mb-2">No data shown in this range</h3>
                    <p className="text-sm text-gray-600">
                        You need to connect QuickBooks or upload a CSV for your data
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function NetDisasterExpense({ bannerData, onDashboard = true, handleSwitchToReview }: Props) {
    // Color palette that rotates through
    const colorPalette = [
        "var(--pink)",
        "var(--fuchsia)",
        "var(--ochre)",
        "var(--seafoam)",
        "var(--charcoal)",
        "var(--teal)",
    ];

    let claimId = "";
    if (bannerData.status === "has-claim" && bannerData.claim) {
        // If claim is an array, use [0] to get the first claim
        claimId = bannerData.claim.id;
    }

    const purchaseLineItems = useQuery({
        queryKey: ["purchaseLineItems-for-company", claimId],
        queryFn: () => getPurchaseLineItemsFromClaim({ claimId }),
    });

    const expenses = purchaseLineItems.data
        ? purchaseLineItems.data.map((purchase) => ({
              name: purchase.description,
              amount: purchase.amountCents / 100.0, // convert cents to dollars
          }))
        : [];

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate percentages and assign colors from palette
    const expensesWithPercentage = expenses.map((exp, index) => ({
        ...exp,
        color: colorPalette[index % colorPalette.length],
        percentage: (exp.amount / totalExpense) * 100,
    }));

    return (
        <Card className="w-full max-w-xl p-[24px] min-h-full">
            <CardContent className="p-0 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="">
                        <h2 className="text-[24px] text-nowrap font-bold">Net Disaster Expenses</h2>
                        <p className="text-[15px] text-nowrap text-charcoal">Expenses from your current claim</p>
                    </div>
                    {!onDashboard && handleSwitchToReview && (
                        <Button
                            className="w-[35px] h-[35px] bg-[var(--slate)] self-start"
                            onClick={handleSwitchToReview}
                        >
                            <BiMessageEdit style={{ fontSize: "18px", width: "18px" }} />
                        </Button>
                    )}
                </div>

                {/* Total Amount */}
                <div className="text-2xl font-bold">${totalExpense.toLocaleString()}</div>

                {/* Stacked Bar Chart */}
                <div
                    className={`flex h-[29px] w-full overflow-hidden ${expensesWithPercentage.length > 1 && "gap-[4px]"}`}
                >
                    {expensesWithPercentage.map((expense, index) => (
                        <div
                            key={index}
                            style={{
                                flex: expense.percentage,
                                backgroundColor: expense.color,
                            }}
                            className="h-full rounded-[4px]"
                        />
                    ))}
                </div>

                {/* Legend with amounts */}
                <div className="space-y-3">
                    {expensesWithPercentage.map((expense, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-[14px] h-[14px] rounded-full flex-shrink-0"
                                    style={{ backgroundColor: expense.color }}
                                />
                                <span className="text-md font-medium">{expense.name}</span>
                            </div>
                            <span className="text-md font-semibold">${expense.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                {onDashboard && (
                    <div className="flex justify-center pt-4">
                        <Link href={"/expense-tracker"} className="text-sm font-semibold no-underline">
                            <Button className="h-10 text-sm text-white rounded-full w-fit px-6 mt-6 bg-fuchsia">
                                See Expense Tracker
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
