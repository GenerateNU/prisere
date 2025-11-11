"use client";
import { getPurchaseLineItemsFromClaim } from "@/api/claim";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BannerData } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

type Props = {
  bannerData: BannerData | null;
};

export default function NetDisasterExpense({ bannerData }: Props) {
    if (!bannerData) {
        return null;
    }
    // Color palette that rotates through
    const colorPalette = [
        "var(--pink)",
        "var(--fuchsia)",
        "var(--ochre)",
        "var(--seafoam)",
        "var(--charcoal)",
        "var(--teal)"
    ];

    let claimStatus = '';
    let claimId = '';
    if (bannerData.status === 'has-claim') {
        // If claim is an array, use [0] to get the first claim
        claimId = Array.isArray(bannerData.claim)
            ? bannerData.claim[0]?.id
            : bannerData.claim.id;
        claimStatus = Array.isArray(bannerData.claim)
            ? bannerData.claim[0]?.status
            : bannerData.claim.status;
    }

    console.log(`CLAIM ID: ${claimId}`)
    console.log(`CLAIM: ${bannerData}`)

    const [page, setPage] = useState(0);
    const [resultsPerPage, setResultsPerPage] = useState(5);

    const purchaseLineItems = useQuery({
        queryKey: ["purchaseLineItems-for-company", claimId],
        queryFn: () => getPurchaseLineItemsFromClaim({claimId}),
        enabled: !!claimId
    });

    const expenses = purchaseLineItems.data
        ? purchaseLineItems.data.map(purchase => ({
            name: purchase.description, // or use another property for a better label
            amount: purchase.amountCents / 100.0, // convert cents to dollars
            }))
        : [];

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate percentages and assign colors from palette
    const expensesWithPercentage = expenses.map((exp, index) => ({
        ...exp,
        color: colorPalette[index % colorPalette.length],
        percentage: (exp.amount / totalExpense) * 100
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
                <div className="text-2xl font-bold">
                    ${totalExpense.toLocaleString()}
                </div>

                {/* Stacked Bar Chart */}
                <div className="flex h-12 w-full rounded-lg overflow-hidden">
                    {expensesWithPercentage.map((expense, index) => (
                        <div
                            key={index}
                            style={{
                                width: `${expense.percentage}%`,
                                backgroundColor: expense.color
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
                            <span className="text-md font-semibold">
                                ${expense.amount.toLocaleString()}
                            </span>
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