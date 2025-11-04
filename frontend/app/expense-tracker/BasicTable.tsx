import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PurchaseLineItem, Purchases } from "@/types/purchase";
import { SortByColumn } from "@/api/purchase";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const columns = ["Merchant", "Amount", "Category", "Date", "Disaster Related"];
const columnsToDBColumns = new Map<string, SortByColumn>([
    ["Date", SortByColumn.DATE],
    ["Amount", SortByColumn.AMOUNT],
]);
type Purchase = Purchases[number];


export default function BasicTable(
    { purchases, changeSorting, sortingState }: {
        purchases: Purchases;
        changeSorting: (column: SortByColumn) => void;
        sortingState: () => string;
    }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col: string) => (
                            <ColumnHeader
                                key={col}
                                column={col}
                                onSort={changeSorting}
                                getSortingState={sortingState}
                            />
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.map((row) => {
                        return (
                            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                                <TableRow key={row.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CollapsibleArrow hasItems={row.lineItems?.length > 0} isOpen={isOpen} />
                                            {getPurchaseInfo(row, "merchant")}
                                        </div>
                                    </TableCell>
                                    <TableCell>${(row.totalAmountCents / 100).toFixed(2)}</TableCell>
                                    <TableCell>{new Date(row.dateCreated).toLocaleDateString()}</TableCell>
                                    <TableCell>{getPurchaseInfo(row, "category")}</TableCell>
                                    <TableCell>{getPurchaseInfo(row, "type")}</TableCell>
                                </TableRow>
                                <CollapsibleContent asChild>
                                    <PurchaseLineItems lineItems={row.lineItems} />
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}

interface ColumnHeaderProps {
    column: string;
    onSort: (column: SortByColumn) => void;
    getSortingState: () => string;
}

function ColumnHeader({ column, onSort, getSortingState }: ColumnHeaderProps) {
    const isSortable = column === "Date" || column === "Amount";

    if (isSortable) {
        return (
            <TableHead
                className="cursor-pointer"
                onClick={() => onSort(columnsToDBColumns.get(column)!)}
            >
                {column + getSortingState()}
            </TableHead>
        );
    }
    return <TableHead>{column}</TableHead>;
}

function PurchaseLineItems({ lineItems }: { lineItems: PurchaseLineItem[] }) {
    if (!lineItems || lineItems.length === 0) {
        return null;
    }

    return (
        <>
            {lineItems.map((lineItem) => (
                <TableRow key={lineItem.id}>
                    <TableCell>{lineItem.description}</TableCell>
                    <TableCell>${(lineItem.amountCents / 100).toFixed(2)}</TableCell>
                    <TableCell>{lineItem.category}</TableCell>
                    <TableCell>{lineItem.dateCreated}</TableCell>
                    <TableCell>{lineItem.type}</TableCell>
                </TableRow>
            ))}
        </>
    );
}


function CollapsibleArrow({ hasItems, isOpen }: { hasItems: boolean, isOpen: boolean }) {
    if (!hasItems) {
        return null;
    }
    return (
        <CollapsibleTrigger asChild>
            <button className="p-1 hover:bg-muted rounded">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
        </CollapsibleTrigger>
    );
}


function getPurchaseInfo(purchase: Purchase, field: string) {
    switch (field) {
        case "merchant":
            // provisional, which description are we using?
            return purchase.lineItems[0].description;
        case "category":
            // provisional, which category
            return purchase.lineItems[0].category;
        default:
            // provisional, this must be if any line item is disaster, then this is disaster related
            return purchase.lineItems[0].type;
    }
}