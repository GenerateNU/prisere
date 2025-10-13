import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Purchase } from "../../types/purchase";
import { Invoice } from "@/types/invoice";
type InvoiceOrPurchase = Invoice | Purchase;
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    Header,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { columns } from "./expense-table";

export default function BasicTable({ combined }: { combined: InvoiceOrPurchase[] }) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({
        data: combined,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        onSortingChange: setSorting,
        state: { sorting },
    });
    const sortedRows = table.getRowModel().rows;
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {table.getHeaderGroups()[0].headers.map((header: Header<InvoiceOrPurchase, unknown>) => (
                            <TableHead
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className="cursor-pointer"
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === "asc" && " ↑"}
                                {header.column.getIsSorted() === "desc" && " ↓"}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedRows.map((row) => {
                        const item = row.original;
                        return (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {"isRefund" in item ? (item.isRefund ? "Refund" : "Purchase") : "Invoice"}
                                </TableCell>
                                <TableCell>${(item.totalAmountCents / 100).toFixed(2)}</TableCell>
                                <TableCell>{new Date(item.dateCreated).toLocaleDateString()}</TableCell>
                                <TableCell>WIP</TableCell>
                                <TableCell>WIP</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}
