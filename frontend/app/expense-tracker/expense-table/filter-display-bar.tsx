import { Badge } from "@/components/ui/badge";
import { FilteredPurchases } from "@/types/purchase";
import dayjs from "dayjs";
import { X } from "lucide-react";

export function FilterDisplay({
    filters,
    removeCategory,
    removeType,
    removeDate,
    clearFilters,
}: {
    filters: FilteredPurchases;
    removeCategory: (category: string) => void;
    removeType: () => void;
    removeDate: () => void;
    clearFilters: () => void;
}) {
    return (
        (filters.type || filters.dateFrom || (filters.categories && filters.categories.length > 0)) && (
            <div className="inline-flex flex-wrap items-center gap-2">
                {filters.categories?.map((cat) => (
                    <AppliedFilter key={cat} label={"Category Included: " + cat} onClear={() => removeCategory(cat)} />
                ))}
                {filters.type && (
                    <AppliedFilter label={"Disaster Related: " + filters.type} onClear={() => removeType()} />
                )}
                {filters.dateTo && filters.dateFrom && (
                    <AppliedFilter
                        label={`Date: ${dayjs(filters.dateFrom).format("MMM D, YYYY")} - ${dayjs(filters.dateTo).format("MMM D, YYYY")}`}
                        onClear={() => removeDate()}
                    />
                )}
                {(filters.type || filters.dateFrom || (filters.categories && filters.categories.length > 0)) && (
                    <button
                        onClick={clearFilters}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium underline-offset-2 ml-1"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
        )
    );
}

function AppliedFilter({ label, onClear }: { label: string; onClear: () => void }) {
    return (
        <Badge variant="outline" className="gap-2 text-sm">
            <button onClick={onClear} className="rounded-sm hover:bg-muted h-[26px]">
                {" "}
                <X className="h-3 w-3" />
            </button>
            {label}
        </Badge>
    );
}
