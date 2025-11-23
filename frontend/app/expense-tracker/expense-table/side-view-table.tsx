"use client";

import { Table } from "@/components/table";
import { getCoreRowModel, getSortedRowModel, getPaginationRowModel, useReactTable, SortingState, Column } from "@tanstack/react-table";
import { useState } from "react";
import CategoryLabel from "./category-options";
import { PurchaseLineItem } from "@/types/purchase";
import PaginationControls from "./PaginationControls";
import { DisasterTypeTag } from "./side-view";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import ResultsPerPageSelect from "./ResultsPerPageSelect";

export default function LineItemsTable({
  lineItems,
}: {
  lineItems: PurchaseLineItem[];
}) {
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
        header: "Item",
        accessorKey: "description",
      },
      {
        id: "amount",
        header: ({ column }) => <SortableHeader column={column} label="Amount" />,
        enableSorting: true,
        accessorFn: (row) => row.amountCents / 100,
        cell: (ctx) => `$${(ctx.getValue() as number).toFixed(2)}`,
      },
      {
        id: "category",
        header: "Category",
        accessorKey: "category",
        cell: (ctx) => <CategoryLabel 
            category={ctx.getValue() as string}
            lineItemIds={[]} 
            editableTags={false} />,
      },
      {
        id: "date",
        header: ({ column }) => <SortableHeader column={column} label="Date" />,
        enableSorting: true,
        accessorFn: (row) => new Date(row.dateCreated),
        cell: (ctx) => (ctx.getValue() as Date).toLocaleDateString(),
      },
      {
        id: "disasterRelated",
        header: "Disaster Related",
        accessorKey: "type",
        cell: (ctx) => <DisasterTypeTag type={ctx.getValue()} />,
      },
    ],
  });

  return (
    <div>
      <Table table={table} />
      <div className="flex items-center justify-between mt-[0.2%] border-t">
        <PaginationControls 
          onPageChange={(newPage) => table.setPageIndex(newPage)}
          page={table.getState().pagination.pageIndex}
          isLastPage={!table.getCanNextPage()}
        />
        <ResultsPerPageSelect 
          value={pagination.pageSize}
          onValueChange={(newSize) => 
            setPagination({ pageIndex: 0, pageSize: newSize })
          }
        />
      </div>
    </div>
  );
}

function SortableHeader({ column, label }: { column: Column<any>; label: string }) {
  const handleSort = () => {
    const currentSort = column.getIsSorted();
    if (currentSort === "asc") {
      column.toggleSorting(true); 
    } else if (currentSort === "desc") {
      column.clearSorting(); // 
    } else {
      column.toggleSorting(false);
    }
  };

  return (
    <button
      onClick={handleSort}
      className="flex items-center gap-2 hover:text-foreground"
    >
      {column.getIsSorted() === "asc" && <ArrowUp className="h-4 w-4" />}
      {column.getIsSorted() === "desc" && <ArrowDown className="h-4 w-4" />}
      {!column.getIsSorted() && <ArrowUpDown className="h-4 w-4" />}
      {label}
    </button>
  );
}