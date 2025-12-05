"use client";
import { fetchAllCategories, fetchPurchases } from "@/api/purchase";
import { LargeLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseSelections } from "@/types/claim";
import { FilteredPurchases, PurchaseLineItemType, PurchaseWithLineItems } from "@/types/purchase";
import { FileUp, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaExclamation } from "react-icons/fa6";
import { IoFilterOutline } from "react-icons/io5";
import { SortByColumn } from "../../../types/purchase";
import { handleExportClick } from "./export";
import { FilterDisplay } from "./filter-display-bar";
import { Filters } from "./filters";
import PaginationControls from "./PaginationControls";
import ResultsPerPageSelect from "./ResultsPerPageSelect";
import ExpenseSideView from "./side-view";
import TableContent from "./table-content";
import { useServerActionQuery } from "@/api/requestHandlers";
import { ServerActionResult } from "@/api/types";

interface ExpenseTableConfig {
    title: string;
    editableTags: boolean;
    rowOption: "collapsible" | "checkbox";
    filterPending?: boolean;
    hasData: boolean;
    setFilterPending?: (fp: boolean) => void;
    selections?: PurchaseSelections;
    setSelections?: (selections: PurchaseSelections) => void;
}

export default function ExpenseTable({
    title,
    editableTags,
    rowOption,
    filterPending = false,
    setFilterPending,
    hasData,
    selections,
    setSelections,
}: ExpenseTableConfig) {
    const [filters, setFilters] = useState<FilteredPurchases>({ pageNumber: 0, resultsPerPage: 5 });
    const [showFilters, setShowFilters] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (filterPending) {
            setFilters((prev) => ({ ...prev, type: PurchaseLineItemType.PENDING, pageNumber: 0 }));
        }
    }, [filterPending]);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithLineItems | null>(null);

    const updateFilter = useCallback(
        (field: string) => (value: unknown) => {
            if (setFilterPending) setFilterPending(false);
            setFilters((prev) => ({ ...prev, [field]: value }));
        },
        [setFilterPending]
    );

    const setSort = useCallback(
        (column: SortByColumn, order?: "ASC" | "DESC") => {
            updateFilter("sortBy")(column);
            updateFilter("sortOrder")(order);
        },
        [updateFilter]
    );

    const removeType = () => {
        updateFilter("type")(undefined);
    };

    const removeCategory = (category: string) => {
        updateFilter("categories")(filters.categories!.filter((cat) => cat !== category));
    };

    const removeDate = () => {
        updateFilter("dateFrom")(undefined);
        updateFilter("dateTo")(undefined);
    };

    const clearFilters = () => {
        removeDate();
        removeType();
        updateFilter("categories")([]);
    };

    const purchases = useFetchPurchases(filters);

    const categories = useFetchAllCategories();

    return (
        <>
            {hasData ? (
                <Card className="border-none shadow-none flex flex-col gap-0 p-[28px] pb-[18px]">
                    <CardHeader className="mb-[16px] p-0">
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                        <CardAction>
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="group h-[34px] bg-slate text-black hover:bg-fuchsia hover:text-white rounded-full px-3 flex items-center gap-2 text-sm w-fit"
                                    style={{ color: "000000" }}
                                >
                                    <IoFilterOutline className="h-4 w-4 text-black group-hover:text-white" />
                                    Filters
                                </Button>
                                <Button
                                    size="icon"
                                    className="h-[2.125rem] w-8 bg-slate rounded-full border-0 hover:bg-fuchsia hover:text-white"
                                    onClick={() =>
                                        handleExportClick(setIsExporting, filters, purchases.data?.numPurchases)
                                    }
                                    disabled={isExporting || purchases.data?.numPurchases === 0}
                                >
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileUp className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="p-0">
                        {showFilters && (
                            <Filters
                                onFilterChange={updateFilter}
                                allCategories={categories.data ?? []}
                                selectedCategories={filters.categories ?? []}
                            />
                        )}
                        <div className="">
                            <FilterDisplay
                                filters={filters}
                                removeCategory={removeCategory}
                                removeType={removeType}
                                removeDate={removeDate}
                                clearFilters={clearFilters}
                            />
                        </div>
                        <div>
                            <TableContent
                                purchases={purchases}
                                filters={filters}
                                setSort={setSort}
                                rowOption={rowOption}
                                editableTags={editableTags}
                                onRowClick={(purchase) => setSelectedPurchase(purchase)}
                                allCategories={categories.data ? categories.data : []}
                                selections={selections}
                                setSelections={setSelections}
                            />
                        </div>

                        <ExpenseSideView
                            purchase={selectedPurchase}
                            open={!!selectedPurchase}
                            onOpenChange={() => setSelectedPurchase(null)}
                        />
                    </CardContent>
                    <CardFooter>
                        <div className="w-full border-t px-4 py-2 flex justify-end">
                            <div className="flex items-center gap-6 shrink-0">
                                <ResultsPerPageSelect
                                    value={filters.resultsPerPage}
                                    onValueChange={updateFilter("resultsPerPage")}
                                />
                                <PaginationControls
                                    page={filters.pageNumber}
                                    onPageChange={updateFilter("pageNumber")}
                                    resultsPerPage={filters.resultsPerPage}
                                    totalCount={purchases.data?.numPurchases ?? 0}
                                />
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            ) : (
                <Card className="h-full p-6 flex flex-col items-center border-none shadow-none justify-start min-h-[300px]">
                    <CardTitle className="text-2xl font-bold self-start">{title}</CardTitle>
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
            )}
        </>
    );
}

export function useFetchPurchases(filters: FilteredPurchases) {
    return useServerActionQuery({
        queryKey: ["purchases-for-company", filters],
        queryFn: async () => {
            return fetchPurchases(filters);
        },
        placeholderData: (previousData) => previousData,
    });
}

export function useFetchAllCategories() {
    return useServerActionQuery({
        queryKey: ["categories-for-purchases"],
        queryFn: async (): Promise<ServerActionResult<string[]>> => {
            return fetchAllCategories();
        },
    });
}
