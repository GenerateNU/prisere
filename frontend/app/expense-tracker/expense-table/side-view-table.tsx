"use client";

import { Table } from "@/components/table";
import { getCoreRowModel, getSortedRowModel, getPaginationRowModel, useReactTable, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import CategoryLabel from "./category-options";
import { PurchaseLineItem } from "@/types/purchase";
import PaginationControls from "./PaginationControls";
import { DisasterTypeTag } from "./side-view";

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
        header: "Amount",
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
        header: "Date",
        enableSorting: true,
        accessorFn: (row) => new Date(row.dateCreated).toLocaleDateString(),
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
      <PaginationControls 
      onPageChange={(newPage) => table.setPageIndex(newPage)}
      page={table.getState().pagination.pageIndex}
      isLastPage={!table.getCanNextPage()}
      />
    </div>
  );
}