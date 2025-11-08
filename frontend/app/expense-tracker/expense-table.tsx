"use client";

import { authHeader, getClient, getClientAuthToken } from "@/api/client";
import { Table } from "@/components/table";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FilteredPurchases, Purchases } from "@/types/purchase";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Filter, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { updateCategory, getAllPurchaseCategories, updateType } from "../../api/purchase";
import { Filters } from "./filters";
import PaginationControls from "./PaginationControls";
import ResultsPerPageSelect from "./ResultsPerPageSelect";
import CategoryLabel from "./category-options";
import DisasterLabel, { DisasterType } from "./disaster-options";

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
                        type: filters.type,
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
                return {
                    amount: purchase.totalAmountCents,
                    date: new Date(purchase.dateCreated),
                    description: getMerchant(purchase.lineItems),
                    category: getCategoriesString(purchase.lineItems),
                    disasterRelated: getPurchaseTypeString(purchase.lineItems),
                    lineItemIds: purchase.lineItems.map((li) => li.id),
                    lineItems: purchase.lineItems.map((lineItem, index) => ({
                        description: lineItem.description ?? "",
                        amount: lineItem.amountCents,
                        category: lineItem.category ?? "",
                        date: new Date(lineItem.dateCreated),
                        disasterRelated: lineItem.type,
                        lineItemIds: [purchase.lineItems[index].id],
                        lineItems: [],
                    })),
                };
            }) ?? [],
        [purchases.data]
    );

    const queryClient = useQueryClient();
    const categoryMutation = useMutation({
        mutationFn: ({ lineItemIds, category , removeCategory }: { category: string, lineItemIds: string[], removeCategory: boolean}) => {
            return updateCategory(category, lineItemIds, removeCategory);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories-for-purchases"] });
            queryClient.invalidateQueries({ queryKey: ["purchases-for-company"] });
        },
    });

    const typeMutation = useMutation({
        mutationFn: ({ lineItemIds, type }: { type: DisasterType, lineItemIds: string[]}) => {
            return updateType(type, lineItemIds);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["purchases-for-company"] });
        },
    });

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
                    const cellVal = cell.getValue();
                    const displayMerchant = cellVal.length > 20 ? `${cellVal.substring(0, 20)}...` : cellVal;
                    return (
                        <div className={cn(row.depth > 0 && "pl-8")}>
                            {row.getCanExpand() ? (
                                <CollapsibleArrow onClick={() => row.toggleExpanded()} isOpen={row.getIsExpanded()} />
                            ) : null}
                            {displayMerchant}
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
                cell: (ctx) => {
                    const row = ctx.row.original;
                    return (
                        <CategoryLabel
                        category={ctx.getValue() as string}
                        updateCategory={( category, lineItemIds,  removeCategory) => {
                            categoryMutation.mutate({ category, lineItemIds, removeCategory });
                        }}
                        lineItemIds={row.lineItemIds}  />
                        );
                }
            },
            { id: "date", header: "Date", accessorFn: (row) => row.date.toLocaleDateString() },
            {
                id: "disasterRelated",
                header: "Disaster Related",
                accessorFn: (row) => row.disasterRelated,
                cell: (ctx) => {
                    const row = ctx.row.original;
                    return (
                        <DisasterLabel
                            disasterType={ctx.getValue()}
                            updateDisasterType={( type, lineItemIds) => {
                                typeMutation.mutate({ type, lineItemIds});
                            }}
                            lineItemIds={row.lineItemIds}  />
                    );
                }
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

function getCategoriesString(lineItems: { category?: string | null }[]): string {
    return lineItems
        .map(li => li.category)
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index)
        .join(",");
}

function getPurchaseTypeString(lineItems: { type?: string | null }[]): DisasterType | null {
    const types = lineItems
        .map(li => li.type)
        .filter(Boolean)

    if (types.length === 0) {
        return "typical";
    } else {
        return types.includes("extraneous") ? "extraneous" : "typical";
    }
}

function getMerchant(lineItems: { description?: string | null }[]): string {
    return lineItems
        .map(li => li.description)
        .filter(Boolean)
        .join(", ");
}
