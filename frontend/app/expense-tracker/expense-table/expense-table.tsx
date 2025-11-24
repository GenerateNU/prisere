"use client";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FilteredPurchases, PurchaseWithLineItems } from "@/types/purchase";
import { FileUp, Filter, Printer } from "lucide-react";
import { useState } from "react";
import { Filters } from "./filters";
import PaginationControls from "./PaginationControls";
import ResultsPerPageSelect from "./ResultsPerPageSelect";
import { Button } from "@/components/ui/button";
import { SortByColumn } from "../../../types/purchase";
import { FilterDisplay } from "./filter-display-bar";
import TableContent from "./table-content";
import { getClientAuthToken, getClient, authHeader, authWrapper } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import ExpenseSideView from "./side-view";

interface ExpenseTableConfig {
    title: string;
    editableTags: boolean;
    rowOption: "collapsible" | "checkbox";
}

export default function ExpenseTable({ title, editableTags, rowOption }: ExpenseTableConfig) {
    const [filters, setFilters] = useState<FilteredPurchases>({ pageNumber: 0, resultsPerPage: 5 });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseWithLineItems | null>(null);

    const updateFilter = (field: string) => (value: unknown) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const setSort = (column: SortByColumn, order?: "ASC" | "DESC") => {
        updateFilter("sortBy")(column);
        updateFilter("sortOrder")(order);
    };

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
                        <Button variant="default" size="icon" className="h-8 w-8 rounded-full border-0">
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="default" size="icon" className="h-8 w-8 rounded-full border-0">
                            <FileUp className="h-4 w-4" />
                        </Button>
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent>
                {showFilters && (
                    <Filters
                        onFilterChange={updateFilter}
                        allCategories={categories.data ?? []}
                        selectedCategories={filters.categories ?? []}
                    ></Filters>
                )}
                <div className="py-2">
                    <FilterDisplay
                        filters={filters}
                        removeCategory={removeCategory}
                        removeType={removeType}
                        removeDate={removeDate}
                        clearFilters={clearFilters}
                    />
                </div>
                <TableContent
                    purchases={purchases}
                    filters={filters}
                    setSort={setSort}
                    rowOption={rowOption}
                    editableTags={editableTags}
                    onRowClick={(purchase) => setSelectedPurchase(purchase)}
                />
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
                            totalNumPurchases={purchases.data?.numPurchases}
                        />
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

export function useFetchPurchases(filters: FilteredPurchases) {
    return useQuery({
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
}

export function useFetchAllCategories() {
    return useQuery({
        queryKey: ["categories-for-purchases"],
        queryFn: async (): Promise<string[]> => {
            const req = async (token: string): Promise<string[]> => {
                const client = getClient();
                const { data, error, response } = await client.GET("/purchase/categories", {
                    headers: authHeader(token),
                });
                if (response.ok) {
                    return data!;
                } else {
                    throw Error(error?.error);
                }
            };

            return authWrapper<string[]>()(req);
        },
    });
}
