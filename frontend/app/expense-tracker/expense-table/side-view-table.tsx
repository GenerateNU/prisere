"use client";

import { Table } from "@/components/table";
import {
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
    Column,
} from "@tanstack/react-table";
import { useState } from "react";
import CategoryLabel from "./category-options";
import { PurchaseLineItem } from "@/types/purchase";
import PaginationControls from "./PaginationControls";
import { DisasterTypeTag } from "./side-view";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import ResultsPerPageSelect from "./ResultsPerPageSelect";

export default function LineItemsTable({ lineItems }: { lineItems: PurchaseLineItem[] }) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        data: lineItems,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        columns: [
            {
                id: "description",
                header: () => <span className="select-none">Item</span>,
                accessorKey: "description",
                cell: ({ getValue }) => {
                    const value = getValue() as string | null;
                    return (
                        <div className="flex text-xs items-center min-h-8 select-none">
                            {" "}
                            {value && value.trim().length > 0 ? value : "Unknown"}{" "}
                        </div>
                    );
                },
            },
            {
                id: "amount",
                header: ({ column }) => <SortableHeader column={column} label="Amount" />,
                enableSorting: true,
                accessorFn: (row) => row.amountCents / 100,
                cell: (ctx) => (
                    <p className="text-xs select-none">{`$${(ctx.getValue() as number).toLocaleString()}`}</p>
                ),
            },
            {
                id: "category",
                header: () => <span className="select-none">Category</span>,
                accessorKey: "category",
                cell: (ctx) => (
                    <CategoryLabel
                        category={ctx.getValue() ? (ctx.getValue() as string) : ""}
                        lineItemIds={[]}
                        editableTags={false}
                    />
                ),
            },
            {
                id: "date",
                header: ({ column }) => <SortableHeader column={column} label="Date" />,
                enableSorting: true,
                accessorFn: (row) => new Date(row.dateCreated).toLocaleDateString(),
                cell: (ctx) => (
                    <div
                        className="text-xs h-10 flex
                 select-none items-center"
                    >
                        {ctx.getValue() as string}
                    </div>
                ),
            },
            {
                id: "disasterRelated",
                header: () => <span className="select-none">Disaster Related</span>,
                accessorKey: "type",
                cell: (ctx) => <DisasterTypeTag type={ctx.getValue()} />,
            },
        ],
    });

    if (lineItems.length === 0) {
        return (
            <div className="text-muted-foreground text-sm italic bg-muted/30 py-6 px-4 rounded-lg border border-muted select-none">
                No line items found for this expense.
            </div>
        );
    }

    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const totalRows = table.getPrePaginationRowModel().rows.length;

    return (
        <div>
            <Table table={table} />
            <div className="flex w-full justify-end mt-[0.2%] border-t px-4 py-2">
                <div className="flex items-center gap-4 shrink-0">
                    <ResultsPerPageSelect
                        value={pagination.pageSize}
                        onValueChange={(newSize) => setPagination({ pageIndex: 0, pageSize: newSize })}
                    />
                    <PaginationControls
                        page={pageIndex}
                        resultsPerPage={pageSize}
                        totalNumPurchases={totalRows}
                        onPageChange={(newPage) => table.setPageIndex(newPage)}
                    />
                </div>
            </div>
        </div>
    );
}

function SortableHeader({ column, label }: { column: Column<PurchaseLineItem>; label: string }) {
    const handleSort = () => column.toggleSorting();
    return (
        <button onClick={handleSort} className="flex items-center gap-2 hover:text-foreground cursor-pointer">
            {column.getIsSorted() === "asc" && <ArrowUp className="h-4 w-4" />}
            {column.getIsSorted() === "desc" && <ArrowDown className="h-4 w-4" />}
            {!column.getIsSorted() && <ArrowUpDown className="h-4 w-4" />}
            {label}
        </button>
    );
}
