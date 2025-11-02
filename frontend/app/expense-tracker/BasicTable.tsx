import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Purchases } from "@/types/purchase";
import { SortByColumn } from "@/api/purchase";

const columns = ["Merchant", "Amount", "Category", "Date", "Disaster Related"];
const columnsToDBColumns = new Map<string, SortByColumn>([
    ["Date", SortByColumn.DATE],
    ["Amount", SortByColumn.AMOUNT]
]);
type Purchase = Purchases[number];


export default function BasicTable(
    { purchases, changeSorting, sortingState }: {
        purchases: Purchases;
        changeSorting: (column: SortByColumn) => void;
        sortingState: () => string;
    }) {
    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col: string) => (
                            (col === "Date" || col === "Amount") ? (
                                <TableHead
                                    className={"cursor-pointer"}
                                    onClick={() => changeSorting(columnsToDBColumns.get("Date")!)}
                                >
                                    {col + sortingState()}
                                </TableHead>
                            ) : (
                                    <TableHead>
                                        {col}
                                    </TableHead>
                                )
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.map((row) => {
                        return (
                            <TableRow key={row.id}>
                                <TableCell>{getPurchaseInfo(row, "merchant")}</TableCell>
                                <TableCell>${(row.totalAmountCents / 100).toFixed(2)}</TableCell>
                                <TableCell>{new Date(row.dateCreated).toLocaleDateString()}</TableCell>
                                <TableCell>{getPurchaseInfo(row, "category")}</TableCell>
                                <TableCell>{getPurchaseInfo(row, "type")}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </>
    );
}



function getPurchaseInfo(purchase: Purchase, field: string) {
    switch(field) {
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