"use client";
import { getClaims } from "@/api/claim";
import PaginationControls from "@/app/expense-tracker/expense-table/PaginationControls";
import ResultsPerPageSelect from "@/app/expense-tracker/expense-table/ResultsPerPageSelect";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BannerAction } from "@/components/ui/shadcn-io/banner";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { IoFilterOutline } from "react-icons/io5";
import { Filters } from "./filters";
import TableContent from "./table-content";

export default function ClaimTable({ claimInProgress }: { claimInProgress: boolean }) {
    const [showFilters, setShowFilters] = useState(true);

    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [search, setSearch] = useState<string | undefined>(undefined);
    const [resultsPerPage, setResultsPerPage] = useState<number>(5);
    const [pageNumber, setPageNumber] = useState<number>(0);

    const claims = useFetchClaims({ date: dateRange, search, page: pageNumber, resultsPerPage });

    return (
        <Card className="border-none shadow-none flex flex-col gap-0 p-[28px] pb-[18px]">
            <CardHeader className="mb-[16px] p-0">
                <CardTitle className="text-2xl font-bold">Claim Reports</CardTitle>
                <CardAction>
                    {claimInProgress ? (
                        <Button
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-[34px] bg-slate text-black rounded-full px-3 flex items-center gap-2 text-sm w-fit"
                            style={{ color: "000000" }}
                        >
                            <IoFilterOutline className="h-4 w-4 text-black" />
                            Filters
                        </Button>
                    ) : (
                        <Link href={`/claims/declare`} className="text-sm font-semibold">
                            <BannerAction className="max-w-xs rounded-full hover:bg-pink bg-fuchsia text-white font-medium">
                                File new claim report
                            </BannerAction>
                        </Link>
                    )}
                </CardAction>
            </CardHeader>
            <CardContent className="p-0">
                {showFilters && (
                    <Filters
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        search={search}
                        onSearchChange={setSearch}
                    />
                )}
                <TableContent claims={claims} />
            </CardContent>
            <CardFooter>
                <div className="w-full border-t px-4 py-2 flex justify-end">
                    <div className="flex items-center gap-6 shrink-0">
                        <ResultsPerPageSelect value={resultsPerPage} onValueChange={setResultsPerPage} />
                        <PaginationControls
                            page={pageNumber}
                            onPageChange={setPageNumber}
                            resultsPerPage={resultsPerPage}
                            totalCount={claims.data?.totalCount ?? 0}
                            hasMore={claims.data?.hasMore ?? false}
                            hasPrevious={claims.data?.hasPrevious ?? false}
                        />
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

export function useFetchClaims(filters: {
    date: DateRange | undefined;
    search: string | undefined;
    page: number;
    resultsPerPage: number;
}) {
    return useQuery({
        queryKey: ["company-claims", filters],
        queryFn: async () => {
            const data = await getClaims({
                filters: {
                    date: filters.date
                        ? { from: filters.date.from?.toISOString(), to: filters.date.to?.toISOString() }
                        : undefined,
                    search: filters.search || undefined,
                },
                page: filters.page,
                resultsPerPage: filters.resultsPerPage,
            });

            console.log(data);
            return data;
        },
        placeholderData: (previousData) => previousData,
    });
}
