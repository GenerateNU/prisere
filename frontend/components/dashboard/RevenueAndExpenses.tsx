"use client";
import { sumInvoicesByCompanyAndDateRange } from "@/api/invoice";
import { sumPurchasesByCompanyAndDateRange } from "@/api/purchase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useQueries } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartConfig } from "@/components/ui/chart";
import Link from "next/link";
import { FaCircle } from "react-icons/fa";
import { LargeLoading } from "../loading";
import { FaExclamation } from "react-icons/fa6";
import ErrorDisplay from "../ErrorDisplay";

export function RevenueAndExpensesNoData() {
    return (
        <Card className="h-full border-none shadow-none flex flex-col p-6 justify-start">
            <CardTitle className="text-2xl font-bold self-start">Revenue and Expenses</CardTitle>
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

export default function RevenueAndExpenses({ onDashboard = true }: { onDashboard?: boolean }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const getMonth = (monthsAgo: number) => {
        return new Date(currentYear, currentMonth - monthsAgo, 1);
    };

    const months = 6;
    const monthDates = Array.from({ length: months }, (_, i) => getMonth(i));

    const revenueQueries = useQueries({
        queries: monthDates.map((date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth =
                month === currentMonth && year === currentYear ? new Date() : new Date(year, month + 1, 0);
            return {
                queryKey: ["revenue", year, month],
                queryFn: () => sumInvoicesByCompanyAndDateRange(startOfMonth, endOfMonth),
            };
        }),
    });

    const expensesQueries = useQueries({
        queries: monthDates.map((date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth =
                month === currentMonth && year === currentYear ? new Date() : new Date(year, month + 1, 0);
            return {
                queryKey: ["expenses", year, month],
                queryFn: () => sumPurchasesByCompanyAndDateRange(startOfMonth, endOfMonth),
            };
        }),
    });

    const getChartData = () => {
        return monthDates
            .map((date, i) => {
                const monthLabel = date.toLocaleDateString("default", { month: "short", year: "2-digit" });
                const revenue = revenueQueries[i].data?.total ?? 0;
                const expenses = expensesQueries[i].data?.total ?? 0;
                return {
                    month: monthLabel,
                    revenue: revenue / 100.0,
                    expenses: expenses / 100.0,
                };
            })
            .reverse();
    };

    const chartData = getChartData();

    const thisMonthRevenue = revenueQueries[0].data?.total ?? 0;
    const lastMonthRevenue = revenueQueries[1]?.data?.total ?? 0;
    const percentChange = lastMonthRevenue === 0 ? 0 : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "var(--seafoam)",
        },
        expenses: {
            label: "Expenses",
            color: "var(--teal)",
        },
    } satisfies ChartConfig;

    const isLoading = expensesQueries.some((q) => q.isLoading) || revenueQueries.some((q) => q.isLoading);
    const error = expensesQueries.some((q) => q.error) || revenueQueries.some((q) => q.error);

    return (
        <Card className="h-full p-6 border-none shadow-none flex flex-col min-h-[260px]">
            <div className="flex flex-col mb-4 gap-2">
                <CardTitle className="text-2xl font-bold">Revenue and Expenses</CardTitle>

                {!isLoading && !error && (
                    <div className="flex items-center gap-2 text-sm py-1 rounded">
                        <div
                            className={`flex items-center rounded py-1 px-2 ${percentChange >= 0 ? "bg-seafoam" : "bg-pink"}`}
                        >
                            <span className={`text-center ${percentChange >= 0 ? "text-teal" : "text-fuchsia"}`}>
                                {percentChange >= 0 ? "+" : ""}
                                {percentChange.toFixed(2)}%
                            </span>
                        </div>
                        <span className="text-charcoal">revenue since last month</span>
                    </div>
                )}
            </div>

            {error ? (
                <CardContent className="p-0 flex-1 flex gap-6">
                    <ErrorDisplay />
                </CardContent>
            ) : isLoading ? (
                <CardContent className="p-0 flex-1 flex gap-6">
                    <LargeLoading />
                </CardContent>
            ) : (
                <CardContent className="p-0 flex-1 flex gap-6 min-h-0">
                    <div className="flex flex-col justify-between min-w-[200px]">
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-charcoal mb-2">
                                    <div className="text-seafoam">
                                        <FaCircle size={10} color="var(--seafoam)" />
                                    </div>
                                    Total Revenue this Month
                                </div>
                                <div className="text-[25px] font-bold">
                                    ${((revenueQueries[0].data?.total ?? 0) / 100.0).toLocaleString()}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-charcoal mb-2">
                                    <div className="text-teal">
                                        <FaCircle size={10} color="var(--teal)" />
                                    </div>
                                    Total Expenses this Month
                                </div>
                                <div className="text-[25px] font-bold">
                                    ${((expensesQueries[0].data?.total ?? 0) / 100.0).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {onDashboard && (
                                    <Link href={"/expense-tracker"} className="text-sm font-semibold underline no-underline ">
                                        <Button className="h-10 text-sm text-white rounded-full w-fit px-6 mt-6 bg-fuchsia hover:bg-pink hover:text-fuchsia">
                                    See Expense Tracker
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-w-0 min-h-0">
                        {/* Legend */}
                        <div className="flex justify-end items-center gap-4 mb-2">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-seafoam"></div>
                                <span>Revenues</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                                <span>Expenses</span>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <BarChart accessibilityLayer data={chartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
