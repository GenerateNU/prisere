import { Table } from "@/components/table";
import { cn } from "@/lib/utils";
import { DisasterType, FilteredPurchases, PurchasesWithCount, PurchaseWithLineItems } from "@/types/purchase";
import { useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { updateCategory, updateType } from "../../../api/purchase";
import CategoryLabel from "./category-options";
import DisasterLabel from "./disaster-options";
import { SortByColumn } from "../../../types/purchase";
import { getCategoriesString, getLineItemDescriptions, getPurchaseTypeString } from "../utility-functions";
import { SortableHeader } from "./sortable-header";
import { CollapsibleArrow } from "@/components/table/collapsibleArrow";

export default function TableContent({
    purchases,
    filters,
    setSort,
    rowOption,
    editableTags,
    onRowClick,
}: {
    purchases: UseQueryResult<PurchasesWithCount | undefined>;
    filters: FilteredPurchases;
    setSort: (column: SortByColumn, sortOrder?: "ASC" | "DESC") => void;
    rowOption: "collapsible" | "checkbox";
    editableTags: boolean;
    onRowClick?: (purchase: PurchaseWithLineItems) => void;
}) {
    const standardizedData = useMemo(
        () =>
            purchases.data?.purchases.map((purchase) => {
                return {
                    originalPurchase: purchase,
                    vendor: purchase.vendor || "Unknown Vendor",
                    amount: purchase.totalAmountCents,
                    date: new Date(purchase.dateCreated),
                    description: getLineItemDescriptions(purchase.lineItems),
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
        mutationFn: ({
            lineItemIds,
            category,
            removeCategory,
        }: {
            category: string;
            lineItemIds: string[];
            removeCategory: boolean;
        }) => {
            return updateCategory(category, lineItemIds, removeCategory);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories-for-purchases"] });
            queryClient.invalidateQueries({ queryKey: ["purchases-for-company"] });
        },
    });
    const typeMutation = useMutation({
        mutationFn: ({ lineItemIds, type }: { type: DisasterType; lineItemIds: string[] }) => {
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
        getSubRows: (row) =>
            row.lineItems?.map((item) => ({
                ...item,
                vendor: row.vendor, // inherit from parent
                originalPurchase: row.originalPurchase,
            })) ?? [],
        enableSubRowSelection(row) {
            return row.original.lineItems.length > 0;
        },
        manualSorting: true,
        columns: [
            {
                id: "merchant",
                header: () => "Merchant",
                accessorFn: (row) => row.vendor,
                cell: ({ row, cell }) => {
                    const cellVal = cell.getValue();
                    const displayVendor = cellVal.length > 20 ? `${cellVal.substring(0, 20)}...` : cellVal;
                    return (
                        <div className={cn("flex items-center", row.depth > 0 && "pl-8")}>
                            {rowOption === "collapsible" ? (
                                row.getCanExpand() ? (
                                    <CollapsibleArrow
                                        onClick={() => row.toggleExpanded()}
                                        isOpen={row.getIsExpanded()}
                                    />
                                ) : null
                            ) : (
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 cursor-pointer mr-2 accent-black align-middle"
                                    onChange={(e) => {
                                        e.stopPropagation();
                                    }}
                                />
                            )}
                            <span className="align-middle">{displayVendor}</span>
                        </div>
                    );
                },
            },
            {
                id: "description",
                header: () => "Description",
                accessorFn: (row) => row.description,
                cell: ({ row, cell }) => {
                    const cellVal = cell.getValue();
                    const displayMerchant = cellVal.length > 20 ? `${cellVal.substring(0, 20)}...` : cellVal;
                    return (
                        <div className={cn("flex items-center", row.depth > 0 && "pl-8")}>
                            <span className="align-middle">{displayMerchant.length > 0 ? displayMerchant : ""}</span>
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
                            updateCategory={(category, lineItemIds, removeCategory) => {
                                categoryMutation.mutate({ category, lineItemIds, removeCategory });
                            }}
                            lineItemIds={row.lineItemIds}
                            editableTags={editableTags}
                            hasLineItems={row.lineItems.length > 0}
                        />
                    );
                },
            },
            {
                id: "date",
                header: () => <SortableHeader column={SortByColumn.DATE} filters={filters} setSort={setSort} />,
                enableSorting: true,
                accessorFn: (row) => row.date.toLocaleDateString(),
            },
            {
                id: "disasterRelated",
                header: "Disaster Related",
                accessorFn: (row) => row.disasterRelated,
                cell: (ctx) => {
                    const row = ctx.row.original;
                    return (
                        <DisasterLabel
                            disasterType={ctx.getValue()}
                            updateDisasterType={(type, lineItemIds) => {
                                typeMutation.mutate({ type, lineItemIds });
                            }}
                            lineItemIds={row.lineItemIds}
                            editableTags={editableTags}
                        />
                    );
                },
            },
        ],
    });

    if (purchases.isPending) return <div>Loading expenses...</div>;

    if (purchases.error) return <div>Error loading expenses</div>;

    return <Table table={table} onRowClick={(row) => onRowClick?.(row.originalPurchase)} />;
}
