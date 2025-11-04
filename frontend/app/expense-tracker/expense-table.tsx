"use client";

import { FilteredPurchases, getAllPurchasesForCompany, SortByColumn } from "@/api/purchase";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import BasicTable from "./BasicTable";
import PaginationControls from "./PaginationControls";
import ResultsPerPageSelect from "./ResultsPerPageSelect";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Filter, Printer } from "lucide-react";
import Filters from "./filters";
import { getAllPurchaseCategories } from "../../api/purchase";

export default function ExpenseTable() {
    const initialFilters: FilteredPurchases = { pageNumber: 0, resultsPerPage : 5}
    const [filters, setFilters] = useState(initialFilters);

    const updateFilter = (field: string) => (value:any) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const purchases = useQuery({
        queryKey: ["purchases-for-company", filters],
        queryFn: () => getAllPurchasesForCompany(filters),
    });

    const categories = useQuery({
        queryKey: ["categories-for-purchases"],
        queryFn: getAllPurchaseCategories,
    });

    if (purchases.isPending || categories.isPending) return <div>Loading expenses...</div>;

    if (purchases.error || categories.error) return <div>Error loading expenses</div>;


    const isLastPage = purchases.data.length < filters.resultsPerPage;

    const changeSorting = (col: SortByColumn) => {
        if (filters.sortBy === col && filters.sortOrder === "ASC") {
            filters.sortOrder = "DESC";
        } else if (filters.sortBy === col) {
            filters.sortOrder = "ASC"
        } else {
            filters.sortBy = col;
            filters.sortOrder = undefined;
        }
    }

    const sortingState = () => filters.sortOrder || "";

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Business Transactions</CardTitle>
                <Filters onFilterChange={updateFilter} categories={categories.data}></Filters>
                <CardAction>
                    <div className="flex gap-2">
                        <Filter></Filter>
                        <Printer></Printer>
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent>
                <BasicTable purchases={purchases.data}
                            changeSorting={changeSorting}
                            sortingState={sortingState} />
            </CardContent>
            <CardFooter>
                <PaginationControls
                    page={filters.pageNumber}
                    onPageChange={updateFilter("pageNumber")}
                    isLastPage={isLastPage} />
                <ResultsPerPageSelect
                    value={filters.resultsPerPage}
                    onValueChange={updateFilter("resultsPerPage")}
                />
            </CardFooter>
        </Card>
    );
}
