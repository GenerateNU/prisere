"use client";

import { authHeader, getClient, getClientAuthToken } from "@/api/client";
import { Table } from "@/components/table";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FilteredPurchases, Purchases } from "@/types/purchase";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Filter, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { getAllPurchaseCategories } from "../../api/purchase";
import { Filters } from "./filters";
import PaginationControls from "./PaginationControls";
import ResultsPerPageSelect from "./ResultsPerPageSelect";

export default function ExpenseTable() {
    const [filters, setFilters] = useState<FilteredPurchases>({ pageNumber: 0, resultsPerPage: 5 });

    const updateFilter = (field: string) => (value: unknown) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const purchases = useQuery({
        queryKey: ["purchases-for-company", filters],
        queryFn: async ({ signal }) => {
            const token = await getClientAuthToken();
            const client = getClient();
            const { data, error, response } = await client.GET("/purchase", {
                params: {
                    query: {
                        categories: filters.categories,
                        dateFrom: filters.dateFrom,
                        dateTo: filters.dateTo,
                        search: filters.search,
                        sortBy: filters.sortBy,
                        sortOrder: filters.sortOrder,
                        pageNumber: filters.pageNumber,
                        resultsPerPage: filters.resultsPerPage,
                    },
                },
                headers: authHeader(token),
                signal,
            });
            if (response.ok) {
                return data;
            } else {
                throw Error(error?.error);
            }
        },
    });

    const categories = useQuery({
        queryKey: ["categories-for-purchases"],
        queryFn: getAllPurchaseCategories,
    });

    const isLastPage = (purchases.data?.length ?? 0) < filters.resultsPerPage;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Business Transactions</CardTitle>
                <CardAction>
                    <div className="flex gap-2">
                        <Filter />
                        <Printer />
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent>
                <Filters onFilterChange={updateFilter} categories={categories.data ?? []}></Filters>
                <TableContent purchases={purchases} />
            </CardContent>
            <CardFooter>
                <PaginationControls
                    page={filters.pageNumber}
                    onPageChange={updateFilter("pageNumber")}
                    isLastPage={isLastPage}
                />
                <ResultsPerPageSelect value={filters.resultsPerPage} onValueChange={updateFilter("resultsPerPage")} />
            </CardFooter>
        </Card>
    );
}

function TableContent({ purchases }: { purchases: UseQueryResult<Purchases | undefined> }) {
    const standardizedData = useMemo(
        () =>
            purchases.data?.map((purchase) => {
                const firstLineItem = purchase.lineItems?.[0];
                return {
                    amount: purchase.totalAmountCents,
                    date: new Date(purchase.dateCreated),
                    description: firstLineItem?.description ?? "",
                    category: firstLineItem?.category ?? "",
                    disasterRelated: firstLineItem?.type === "extraneous" ? "Disaster" : "Non-disaster",
                    lineItems: purchase.lineItems.map((lineItem) => ({
                        description: lineItem.description ?? "",
                        amount: lineItem.amountCents,
                        category: lineItem.category ?? "",
                        date: new Date(lineItem.dateCreated),
                        disasterRelated: lineItem.type === "extraneous" ? "Disaster" : "Non-disaster",
                        lineItems: [],
                    })),
                };
            }) ?? [],
        [purchases.data]
    );

    const table = useReactTable({
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        data: standardizedData,
        getSubRows: (row) => row.lineItems ?? [],
        enableSubRowSelection(row) {
            return row.original.lineItems.length > 0;
        },
        columns: [
            {
                id: "merchant",
                header: "Merchant",
                accessorFn: (row) => row.description,
                cell: ({ row, cell }) => {
                    return (
                        <div className={cn(row.depth > 0 && "pl-8")}>
                            {row.getCanExpand() ? (
                                <CollapsibleArrow onClick={() => row.toggleExpanded()} isOpen={row.getIsExpanded()} />
                            ) : null}
                            {cell.getValue()}
                        </div>
                    );
                },
            },
            {
                id: "amount",
                header: "Amount",
                accessorFn: (row) => row.amount / 100,
                cell: (ctx) => `$${(ctx.getValue() as number).toFixed(2)}`,
            },
            {
                id: "category",
                header: "Category",
                accessorFn: (row) => row.category,
            },
            { id: "date", header: "Date", accessorFn: (row) => row.date.toLocaleDateString() },
            {
                id: "disasterRelated",
                header: "Disaster Related",
                accessorFn: (row) => row.disasterRelated,
            },
        ],
    });

    if (purchases.isPending) return <div>Loading expenses...</div>;

    if (purchases.error) return <div>Error loading expenses</div>;

    return <Table table={table} />;
}

function CollapsibleArrow({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
    return (
        <button
            className="p-1 hover:bg-muted rounded"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
        >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
    );
}
