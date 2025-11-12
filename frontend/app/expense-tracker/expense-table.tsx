"use client";


import { Table } from "@/components/table";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DisasterType, FilteredPurchases, Purchases } from "@/types/purchase";
import { useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, FileUp, Filter, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { fetchAllCategories, fetchPurchases, updateCategory, updateType } from "../../api/purchase";
import { Filters } from "./filters";
import PaginationControls from "./PaginationControls";
import ResultsPerPageSelect from "./ResultsPerPageSelect";
import CategoryLabel from "./category-options";
import DisasterLabel from "./disaster-options";
import { Button } from "@/components/ui/button";
import { SortByColumn } from "../../types/purchase";
import { FilterDisplay } from "./filter-display-bar";
import { getCategoriesString, getMerchant, getPurchaseTypeString } from "./utility-functions";
import { SortableHeader } from "./sortable-header";


interface ExpenseTableConfig {
    title: string,
    editableTags: boolean;
    rowOption: 'collapsible' | 'checkbox';
}


export default function ExpenseTable({title, editableTags, rowOption} : ExpenseTableConfig) {
    const [filters, setFilters] = useState<FilteredPurchases>({ pageNumber: 0, resultsPerPage: 5 });
    const [showFilters, setShowFilters] = useState(false);

    const updateFilter = (field: string) => (value: unknown) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const setSort = (column : SortByColumn, order?: 'ASC' | 'DESC') => {
        updateFilter("sortBy")(column);
        updateFilter("sortOrder")(order);
    }

    const removeType = () => {
        updateFilter("type")(undefined)
    }

    const removeCategory = (category: string) => {
        updateFilter("categories")(filters.categories!.filter(cat => cat !== category))
    }

    const removeDate = () => {
        updateFilter("dateFrom")(undefined);
        updateFilter("dateTo")(undefined);
    }

    const clearFilters = () => {
        removeDate();
        removeType();
        updateFilter("categories")([]);
    }

    const purchases = fetchPurchases(filters);

    const categories = fetchAllCategories();

    const isLastPage = (purchases.data?.length ?? 0) < filters.resultsPerPage;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardAction>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant={showFilters ? "secondary" : "default"}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-8 rounded-full px-3 flex items-center gap-2 text-sm"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filters</span>
                        </Button>
                        <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 rounded-full border-0"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="default"
                            size="icon"
                            className="h-8 w-8 rounded-full border-0"
                        >
                            <FileUp className="h-4 w-4" />
                        </Button>
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent>
                {showFilters && <Filters onFilterChange={updateFilter}
                                         allCategories={categories.data ?? []}
                                         selectedCategories={filters.categories ?? []}
                ></Filters>}
                <div className="py-2">
                <FilterDisplay
                    filters={filters}
                    removeCategory={removeCategory}
                    removeType={removeType}
                    removeDate={removeDate}
                    clearFilters={clearFilters}
                />
                </div>
                <TableContent purchases={purchases} filters={filters} setSort={setSort} rowOption={rowOption}
                editableTags={editableTags}/>
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

function TableContent({ purchases, filters, setSort, rowOption, editableTags }:
                      { purchases: UseQueryResult<Purchases | undefined>,
                          filters: FilteredPurchases;
                          setSort: (column: SortByColumn, sortOrder?: 'ASC' | 'DESC') => void;
                          rowOption: 'collapsible' | 'checkbox',
                          editableTags: boolean,
                      }) {
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
        manualSorting: true,
        columns: [
            {
                id: "merchant",
                header: () => "Merchant",
                accessorFn: (row) => row.description,
                cell: ({ row, cell }) => {
                    const cellVal = cell.getValue();
                    const displayMerchant = cellVal.length > 20 ? `${cellVal.substring(0, 20)}...` : cellVal;
                    return (
                        <div className={cn("flex items-center", row.depth > 0 && "pl-8")}>
                            {rowOption === 'collapsible' ? (
                                row.getCanExpand() ? (
                                    <CollapsibleArrow onClick={() => row.toggleExpanded()} isOpen={row.getIsExpanded()} />
                                ) : null
                            ) : (
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 cursor-pointer mr-2 accent-black align-middle"
                                    onChange={(e) => {
                                        // Handle checkbox selection
                                        e.stopPropagation();
                                    }}
                                />
                            )}
                            <span className="align-middle">
                                {displayMerchant.length > 0 ? displayMerchant : "Unknown Merchant"}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "amount",
                header: () => <SortableHeader column={SortByColumn.AMOUNT} filters={filters} setSort={setSort} />,
                enableSorting: true,
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
                        lineItemIds={row.lineItemIds}
                        editableTags={editableTags}/>
                        );
                }
            },
            {
                id: "date",
                header: () => <SortableHeader column={SortByColumn.DATE} filters={filters} setSort={setSort} />,
                enableSorting: true,
                accessorFn: (row) => row.date.toLocaleDateString() },
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
                            lineItemIds={row.lineItemIds}
                            editableTags={editableTags}
                        />
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