"use client";
import { getPurchaseLineItemsFromClaim } from "@/api/claim";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BannerData } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BiMessageEdit } from "react-icons/bi";
import { LargeLoading } from "../loading";
import { FaExclamation } from "react-icons/fa6";
import ErrorDisplay from "../ErrorDisplay";

type Props = {
    bannerData: BannerData;
    onDashboard?: boolean;
    handleSwitchToReview?: () => void;
};

// No Data Component
export function NetDisasterExpenseNoData() {
    return (
        <Card className="w-full h-full flex flex-col max-w-xl p-[24px] border-none shadow-none">
            <div className="flex items-center justify-between">
                <div className="">
                    <h2 className="text-[24px] text-nowrap font-bold">Net Disaster Expenses</h2>
                </div>
            </div>
            <div className="relative flex items-center justify-center w-full h-full flex-1">
                <CardContent className="p-0 z-0 absolute w-full h-full flex-1">
                    <LargeLoading />
                </CardContent>
                <div className="flex flex-1 flex-col items-center justify-center h-full text-center gap-4 z-10 relative">
                    <div className="flex w-16 h-16 bg-fuchsia rounded-full items-center justify-center">
                        <FaExclamation color="white" size={50} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">No data shown in this range</h3>
                        <p className="text-sm text-gray-600">
                            You need to connect QuickBooks or upload a CSV for your data
                        </p>
                    </div>
                </div>
            </div>
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
        <Card className="w-full max-w-xl p-[24px] border-none shadow-none flex flex-col h-full max-h-[603px]">
            <CardHeader className="p-0 flex-shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="">
                        <h2 className="text-[24px] text-nowrap font-bold">Net Disaster Expenses</h2>
                        <p className="text-[15px] text-nowrap text-charcoal">Expenses from your current claim</p>
                    </div>
                    {!onDashboard && handleSwitchToReview && (
                        <Button
                            className="group w-[35px] h-[35px] bg-[var(--slate)] self-start hover:bg-fuchsia hover:text-white"
                            onClick={handleSwitchToReview}
                        >
                            <BiMessageEdit
                                style={{ fontSize: "18px", width: "18px" }}
                                className="group-hover:text-white"
                            />
                        </Button>
                    )}
                </div>
            </CardHeader>
            {purchaseLineItems.isLoading ? (
                <CardContent className="flex-1 flex p-0">
                    <LargeLoading />
                </CardContent>
            ) : purchaseLineItems.error ? (
                <CardContent className="flex-1 flex p-0">
                    <ErrorDisplay />
                </CardContent>
            ) : (
                <>
                    <CardContent className="p-0 flex-1 overflow-y-auto pr-2 ">
                        <div className="space-y-6">
                            {/* Total Amount */}
                            <div className="text-2xl font-bold">${totalExpense.toLocaleString()}</div>
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
                            <div className="space-y-3">
                                {(onDashboard ? expensesWithPercentage.slice(0, 5) : expensesWithPercentage).map(
                                    (expense, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-[14px] h-[14px] rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: expense.color }}
                                                />
                                                <span className="text-md font-medium">
                                                    {expense.name || "Unknown Item"}
                                                </span>
                                            </div>
                                            <span className="text-md font-semibold">
                                                ${expense.amount.toLocaleString()}
                                            </span>
                                        </div>
                                    )
                                )}
                                {onDashboard && expensesWithPercentage.length > 5 && (
                                    <div className="text-sm text-gray-500">
                                        Showing 5 of {expensesWithPercentage.length}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    {onDashboard && (
                        <div className="flex justify-center pt-6 flex-shrink-0">
                            <Link href={"/expense-tracker"} className="text-sm font-semibold no-underline">
                                <Button className="h-10 text-sm text-white rounded-full w-fit px-6 mt-6 bg-fuchsia hover:bg-pink hover:text-fuchsia">
                                    See Expense Tracker
                                </Button>
                            </Link>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
