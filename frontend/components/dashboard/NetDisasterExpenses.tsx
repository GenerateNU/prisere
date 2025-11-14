"use client";
import { getPurchaseLineItemsFromClaim } from "@/api/claim";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BannerData } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type Props = {
    bannerData: BannerData | null;
    hasData: boolean;
};

// No Data Component
function NetDisasterExpenseNoData() {
    return (
        <Card className="w-full max-w-xl p-8 border-none shadow-lg">
            <CardContent className="p-0 flex flex-col items-center justify-center min-h-[300px] gap-4">
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

                <div className="text-center max-w-xs">
                    <h3 className="text-lg font-bold mb-2">No data shown in this range</h3>
                    <p className="text-sm text-gray-600">
                        You need to connect QuickBooks or upload a CSV for your data
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function NetDisasterExpense({ bannerData, hasData }: Props) {
    if (!bannerData) {
        return null;
    }

    // If no data, show the no data version
    if (!hasData) {
        return <NetDisasterExpenseNoData />;
    }

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
    if (bannerData.status === "has-claim") {
        // If claim is an array, use [0] to get the first claim
        claimId = bannerData.claim.id;
    }

    console.log(`CLAIM ID: ${claimId}`);
    console.log(`CLAIM: ${bannerData}`);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const purchaseLineItems = useQuery({
        queryKey: ["purchaseLineItems-for-company", claimId],
        queryFn: () => getPurchaseLineItemsFromClaim({ claimId }),
        enabled: !!claimId,
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
        <Card className="w-full max-w-xl p-8 border-none shadow-lg">
            <CardContent className="p-0 space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold">Net Disaster Expense</h2>
                    <p className="text-md text-charcoal">Expenses from your current claim</p>
                </div>

                {/* Total Amount */}
                <div className="text-2xl font-bold">${totalExpense.toLocaleString()}</div>

                {/* Stacked Bar Chart */}
                <div className="flex h-12 w-full rounded-lg overflow-hidden">
                    {expensesWithPercentage.map((expense, index) => (
                        <div
                            key={index}
                            style={{
                                width: `${expense.percentage}%`,
                                backgroundColor: expense.color,
                            }}
                            className="h-full"
                        />
                    ))}
                </div>

                {/* Legend with amounts */}
                <div className="space-y-3">
                    {expensesWithPercentage.map((expense, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-5 h-5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: expense.color }}
                                />
                                <span className="text-md font-medium">{expense.name}</span>
                            </div>
                            <span className="text-md font-semibold">${expense.amount.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                {/* Button */}
                <div className="flex justify-center pt-4">
                    <Link href={"/expense-tracker"} className="text-sm font-semibold underline no-underline">
                        <Button className="h-10 text-sm text-white rounded-full w-fit px-6 mt-6 bg-fuchsia">
                            See Expense Tracker
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
