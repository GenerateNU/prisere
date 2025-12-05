import { Table } from "@/components/table";
import { CollapsibleArrow } from "@/components/table/collapsibleArrow";
import { Checkbox } from "@/components/ui/checkbox";
import { TABLE_HEADER_HEIGHT, TABLE_ROW_HEIGHT } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PurchaseSelections } from "@/types/claim";
import { DisasterType, FilteredPurchases, PurchasesWithCount, PurchaseWithLineItems } from "@/types/purchase";
import { useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { getCoreRowModel, getExpandedRowModel, Row, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { updateCategory, updateType } from "../../../api/purchase";
import { SortByColumn } from "../../../types/purchase";
import { getCategoriesString, getPurchaseTypeString } from "../utility-functions";
import CategoryLabel from "./category-options";
import DisasterLabel from "./disaster-options";
import { SortableHeader } from "./sortable-header";

type StandardizedRow = {
    id: string;
    vendor?: string;
    amount: number;
    date: Date;
    category: string;
    disasterRelated: string | DisasterType | null;
    lineItemIds: string[];
    lineItems: StandardizedRow[];
    originalPurchase: PurchaseWithLineItems;
};

export default function TableContent({
    purchases,
    filters,
    setSort,
    rowOption,
    editableTags,
    selections,
    setSelections,
    onRowClick,
    allCategories,
}: {
    purchases: UseQueryResult<PurchasesWithCount | undefined>;
    filters: FilteredPurchases;
    setSort: (column: SortByColumn, sortOrder?: "ASC" | "DESC") => void;
    rowOption: "collapsible" | "checkbox";
    editableTags: boolean;
    selections?: PurchaseSelections;
    setSelections?: (selections: PurchaseSelections) => void;
    onRowClick?: (purchase: PurchaseWithLineItems) => void;
    allCategories: string[];
}) {
    const standardizedData: StandardizedRow[] = useMemo(
        () =>
            purchases.data?.purchases.map((purchase) => {
                return {
                    originalPurchase: purchase,
                    id: purchase.id,
                    vendor: purchase.vendor || "Unknown Vendor",
                    amount: purchase.totalAmountCents,
                    date: new Date(purchase.dateCreated),
                    category: getCategoriesString(purchase.lineItems),
                    disasterRelated: getPurchaseTypeString(purchase.lineItems),
                    lineItemIds: purchase.lineItems.map((li) => li.id),
                    lineItems: purchase.lineItems.map((lineItem, index) => ({
                        originalPurchase: purchase,
                        vendor: lineItem.description ?? "Unknown Item",
                        id: `${purchase.id}-${lineItem.id}`,
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

    // Helper functions for selection logic
    const isParentSelected = (purchaseId: string): boolean => {
        if (selections) {
            return selections.fullPurchaseIds.includes(purchaseId);
        }
        return false;
    };

    const isLineItemSelected = (lineItemId: string, parentPurchaseId: string): boolean => {
        if (selections) {
            return (
                selections.partialLineItemIds.includes(lineItemId) ||
                selections.fullPurchaseIds.includes(parentPurchaseId)
            );
        }
        return false;
    };

    const toggleParent = (purchaseId: string, allLineItemIds: string[]) => {
        if (!setSelections || !selections) return;

        const isSelected = selections.fullPurchaseIds.includes(purchaseId);

        setSelections({
            fullPurchaseIds: isSelected
                ? selections.fullPurchaseIds.filter((id) => id !== purchaseId)
                : [...selections.fullPurchaseIds, purchaseId],
            partialLineItemIds: selections.partialLineItemIds.filter((id) => !allLineItemIds.includes(id)),
        });
    };

    const toggleLineItem = (lineItemId: string, purchaseId: string, allLineItemIds: string[]) => {
        if (!setSelections || !selections) return;

        const isParentFullySelected = selections.fullPurchaseIds.includes(purchaseId);
        const isLineItemPartiallySelected = selections.partialLineItemIds.includes(lineItemId);

        if (isParentFullySelected) {
            // Parent is fully selected - demote to partial selection without this line item
            setSelections({
                fullPurchaseIds: selections.fullPurchaseIds.filter((id) => id !== purchaseId),
                partialLineItemIds: [
                    ...selections.partialLineItemIds.filter((id) => !allLineItemIds.includes(id)),
                    ...allLineItemIds.filter((id) => id !== lineItemId),
                ],
            });
        } else if (isLineItemPartiallySelected) {
            // Unselect this line item
            setSelections({
                ...selections,
                partialLineItemIds: selections.partialLineItemIds.filter((id) => id !== lineItemId),
            });
        } else {
            // Select line item
            const newPartialIds = [...selections.partialLineItemIds, lineItemId];

            // Check if all line items are now selected - promote to full purchase
            if (allLineItemIds.every((id) => newPartialIds.includes(id))) {
                setSelections({
                    fullPurchaseIds: [...selections.fullPurchaseIds, purchaseId],
                    partialLineItemIds: newPartialIds.filter((id) => !allLineItemIds.includes(id)),
                });
            } else {
                setSelections({
                    ...selections,
                    partialLineItemIds: newPartialIds,
                });
            }
        }
    };
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
                    const canExpand = row.getCanExpand();
                    const purchaseId = row.original.id;
                    const parentPurchaseId = row.original.originalPurchase.id;
                    const lineItemId = row.original.lineItemIds[0];
                    const allLineItemIds = row.original.originalPurchase.lineItems.map((li) => li.id);

                    const isChecked = canExpand
                        ? isParentSelected(purchaseId)
                        : isLineItemSelected(lineItemId, parentPurchaseId);

                    const handleToggle = () => {
                        if (canExpand) {
                            toggleParent(purchaseId, allLineItemIds);
                        } else {
                            toggleLineItem(lineItemId, parentPurchaseId, allLineItemIds);
                        }
                    };

                    return (
                        <div
                            className={cn("flex items-center min-w-48", row.depth > 0 && "pl-8")}
                            style={{ height: `${TABLE_ROW_HEIGHT}rem` }}
                        >
                            {setSelections && selections && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        className={cn(!row.getCanExpand() && "mr-3")}
                                        checked={isChecked}
                                        onCheckedChange={handleToggle}
                                    />
                                </div>
                            )}
                            {rowOption === "collapsible" && row.getCanExpand() && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <CollapsibleArrow
                                        onClick={() => row.toggleExpanded()}
                                        isOpen={row.getIsExpanded()}
                                    />
                                </div>
                            )}
                            <span className="align-middle">{displayVendor}</span>
                        </div>
                    );
                },
            },
            {
                id: "amount",
                header: () => <SortableHeader column={SortByColumn.AMOUNT} filters={filters} setSort={setSort} />,
                enableSorting: true,
                accessorFn: (row) => row.amount / 100,
                cell: (ctx) => (
                    <div className="flex items-center min-w-28" style={{ height: `${TABLE_ROW_HEIGHT}rem` }}>
                        <p className="text-xs">{`$${(ctx.getValue() as number).toLocaleString()}`}</p>
                    </div>
                ),
            },
            {
                id: "category",
                header: "Category",
                accessorFn: (row) => row.category,
                cell: (ctx) => {
                    const row = ctx.row.original;
                    return (
                        <div className="flex items-center min-w-75" style={{ height: `${TABLE_ROW_HEIGHT}rem` }}>
                            <CategoryLabel
                                category={ctx.getValue() as string}
                                updateCategory={(category, lineItemIds, removeCategory) => {
                                    categoryMutation.mutate({ category, lineItemIds, removeCategory });
                                }}
                                lineItemIds={row.lineItemIds}
                                editableTags={editableTags}
                                allCategories={allCategories}
                            />
                        </div>
                    );
                },
            },
            {
                id: "date",
                header: () => <SortableHeader column={SortByColumn.DATE} filters={filters} setSort={setSort} />,
                enableSorting: true,
                accessorFn: (row) => row.date.toLocaleDateString(),
                cell: (ctx) => (
                    <div className="text-xs flex items-center min-w-48" style={{ height: `${TABLE_ROW_HEIGHT}rem` }}>
                        {ctx.getValue() as string}
                    </div>
                ),
            },
            {
                id: "disasterRelated",
                header: () => (
                    <div className="flex items-center" style={{ height: `${TABLE_HEADER_HEIGHT}rem` }}>
                        Disaster Related
                    </div>
                ),
                accessorFn: (row) => row.disasterRelated,
                cell: (ctx) => {
                    const row = ctx.row.original;
                    return (
                        <div className="flex items-center min-w-48" style={{ height: `${TABLE_ROW_HEIGHT}rem` }}>
                            <DisasterLabel
                                disasterType={ctx.getValue()}
                                updateDisasterType={(type, lineItemIds) => {
                                    typeMutation.mutate({ type, lineItemIds });
                                }}
                                lineItemIds={row.lineItemIds}
                                editableTags={editableTags}
                            />
                        </div>
                    );
                },
            },
        ],
    });

    const getRowClassName = (row: Row<StandardizedRow>) => {
        if (!selections || !setSelections) return "";

        const canExpand = row.getCanExpand();
        const purchaseId = row.original.id;
        const parentPurchaseId = row.original.originalPurchase.id;
        const lineItemId = row.original.lineItemIds[0];

        const selected = canExpand ? isParentSelected(purchaseId) : isLineItemSelected(lineItemId, parentPurchaseId);

        return selected ? "bg-slate-100" : "";
    };

    return (
        <Table
            table={table}
            isLoading={purchases.isLoading}
            onRowClick={(row) => onRowClick?.(row.originalPurchase)}
            getRowClassName={getRowClassName}
        />
    );
}
