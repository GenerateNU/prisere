'use client';
import { sumInvoicesByCompanyAndDateRange } from "@/api/invoice";
import { sumPurchasesByCompanyAndDateRange } from "@/api/purchase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import NavBarCircle from "@/icons/NavBarCircle";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartConfig } from "@/components/ui/chart"

export default function RevenueAndExpenses({ showLinks = true }: { showLinks?: boolean }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const getMonth = (monthsAgo: number) => {
        return new Date(currentYear, currentMonth - monthsAgo, 1);
    };

    const months = 6;
    const monthDates = Array.from({ length: months }, (_, i) => getMonth(i));

    const revenueQueries = monthDates.map(date => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth =
            month === currentMonth && year === currentYear
            ? new Date()
            : new Date(year, month + 1, 0);
        return useQuery({
            queryKey: ['revenue', year, month],
            queryFn: () => sumInvoicesByCompanyAndDateRange(startOfMonth, endOfMonth),
        });
    });

    const expensesQueries = monthDates.map(date => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth =
            month === currentMonth && year === currentYear
            ? new Date()
            : new Date(year, month + 1, 0);
        return useQuery({
            queryKey: ['expenses', year, month],
            queryFn: () => sumPurchasesByCompanyAndDateRange(startOfMonth, endOfMonth),
        });
    });

    const getChartData = () => {
        return monthDates.map((date, i) => {
            const monthLabel = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
            const revenue = revenueQueries[i].data?.total ?? 0;
            const expenses = expensesQueries[i].data?.total ?? 0;
            return {
                month: monthLabel,
                revenue: revenue / 100.0,
                expenses: expenses / 100.0
            }
        }).reverse()
    };

    const chartData = getChartData();

    const thisMonthRevenue = revenueQueries[0].data?.total ?? 0;
    const lastMonthRevenue = revenueQueries[1]?.data?.total ?? 0;
    const percentChange =
        lastMonthRevenue === 0
            ? 0
            : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    const chartConfig = {
        revenue: {
            label: "Revenue",
            color: "var(--seafoam)",
        },
        expenses: {
            label: "Expenses",
            color: "var(--teal)",
        },
    } satisfies ChartConfig

    function ChangeIcon({ up }: { up: boolean }) {
        return up ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--seafoam)"><path d="M6 2l4 6H2z"/></svg>
        ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--fuchsia)"><path d="M6 10l4-6H2z"/></svg>
        );
    }

    return (
        <Card className="h-full min-h-[371px] p-6 border flex flex-col">
            {/* Header with title and percentage change */}
            <div className="flex flex-col mb-4 gap-2">
                <CardTitle className="text-2xl font-bold">Revenue and Expenses</CardTitle>
                
                <div className="flex items-center gap-2 text-sm py-1 rounded">
                    <div className={
                        percentChange >= 0
                            ? "bg-seafoam flex items-center rounded p-1"
                            : "bg-pink flex items-center rounded p-1"
                    }>
                        <ChangeIcon up={percentChange >= 0} />

                    <span className={percentChange >= 0 ? "text-teal" : "text-fuchsia"}>
                        {percentChange >= 0 ? "+" : ""}
                        {percentChange.toFixed(2)}%
                    </span>
                    </div>
                    <span className="text-charcoal">revenue since last month</span>
                </div>
            </div>

            <CardContent className="p-0 flex-1 flex gap-6">
                {/* Left side - Stats */}
                <div className="flex flex-col justify-between min-w-[200px]">
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-charcoal mb-2">
                                <div className="text-seafoam">
                                    <NavBarCircle size={10} />
                                </div>
                                Total Revenue this Month
                            </div>
                            <div className="text-4xl font-bold">
                                ${(revenueQueries[0].data?.total ?? 0) / 100.0}
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 text-sm text-charcoal mb-2">
                                <div className="text-teal">
                                    <NavBarCircle size={10} />
                                </div>
                                Total Expenses this Month
                            </div>
                            <div className="text-4xl font-bold">
                                ${(expensesQueries[0].data?.total ?? 0) / 100.0}
                            </div>
                        </div>
                    </div>

                    {showLinks && (
                        <Button className="h-10 text-sm text-white rounded-full w-fit px-6 mt-6 bg-fuchsia">
                            See Expense Tracker
                        </Button>
                    )}
                </div>

                {/* Right side - Chart with legend */}
                <div className="flex-1 flex flex-col min-w-0">
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

                    {/* Chart */}
                    <div className="flex-1 min-h-0">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis 
                                    dataKey="month" 
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}