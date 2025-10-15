"use client";

import { getAllInvoicesForCompany } from "@/api/invoice";
import { getAllPurchasesForCompany } from "@/api/purchase";
import { useQuery } from "@tanstack/react-query";
import { Purchase } from "../../types/purchase";
import { Invoice } from "@/types/invoice";
import { ColumnDef } from "@tanstack/react-table";
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

export const columns: ColumnDef<Purchase>[] = [
    {
        id: "type",
        header: "Type",
    },
    {
        accessorKey: "totalAmountCents",
        header: "Amount",
    },
    {
        accessorKey: "dateCreated",
        header: "Date",
    },
    {
        id: "category",
        header: "Category",
    },
    {
        id: "disaster",
        header: "Disaster",
    },
];

export default function ExpenseTable({ companyId }: { companyId: string }) {
    const [page, setPage] = useState(0);
    const [resultsPerPage, setResultsPerPage] = useState(5);

    const purchases = useQuery({
        queryKey: ["purchases-for-company", companyId, page, resultsPerPage],
        queryFn: () => getAllPurchasesForCompany(companyId, page, resultsPerPage),
    });

    if (purchases.isPending) return <div>Loading expenses...</div>;

    if (purchases.error) return <div>Error loading expenses</div>;

    const isLastPage = purchases.data.length < resultsPerPage;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Business Transactions</CardTitle>
                <CardDescription>Description</CardDescription>
                <CardAction>
                    <div className="flex gap-2">
                        <Filter></Filter>
                        <Printer></Printer>
                    </div>
                </CardAction>
            </CardHeader>
            <CardContent>
                <BasicTable purchases={purchases.data} />
            </CardContent>
            <CardFooter>
                <PaginationControls
                    page={page}
                    onPageChange={(page: number) => setPage(page)}
                    isLastPage={isLastPage}
                />
                <ResultsPerPageSelect
                    value={resultsPerPage}
                    onValueChange={(results: number) => setResultsPerPage(results)}
                />
            </CardFooter>
        </Card>
    );
}
