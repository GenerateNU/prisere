import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { FilteredPurchases, SortByColumn } from "../../../types/purchase";

interface SortableHeaderProps {
    column: SortByColumn;
    filters: FilteredPurchases;
    setSort: (column: SortByColumn, sortOrder?: "ASC" | "DESC") => void;
}

export function SortableHeader({ column, filters, setSort }: SortableHeaderProps) {
    const sortColumnLabels: Record<SortByColumn, string> = {
        [SortByColumn.DATE]: "Date",
        [SortByColumn.AMOUNT]: "Amount",
    };
    const handleClick = () => {
        if (filters.sortBy === column && filters.sortOrder === "ASC") {
            setSort(column, "DESC");
        } else if (filters.sortBy === column && filters.sortOrder === "DESC") {
            setSort(column, undefined);
        } else {
            setSort(column, "ASC");
        }
    };
    return (
        <button className="flex w-full gap-2 font-medium hover:text-foreground" onClick={handleClick}>
            {filters.sortBy === column ? (
                filters.sortOrder === "ASC" ? (
                    <ArrowUp className="h-4 w-4" />
                ) : (
                    <ArrowDown className="h-4 w-4" />
                )
            ) : (
                <ArrowUpDown className="h-4 w-4" />
            )}
            {sortColumnLabels[column]}
        </button>
    );
}
