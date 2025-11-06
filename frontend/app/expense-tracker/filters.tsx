import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PurchaseLineItemType } from "@/types/purchase";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import dayjs from "dayjs";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export function Filters({
    onFilterChange,
    categories,
}: {
    onFilterChange: (field: string) => (value: unknown) => void;
    categories: string[];
}) {
    const onDateRangeChange = (range: DateRange | undefined) => {
        if (range?.from) {
            onFilterChange("dateFrom")(range.from.toISOString());
        } else {
            onFilterChange("dateFrom")(undefined);
        }
        if (range?.to) {
            onFilterChange("dateTo")(range.to.toISOString());
        } else {
            onFilterChange("dateTo")(undefined);
        }
    };

    const onTypeChange = (type: PurchaseLineItemType) => onFilterChange("type")(type);

    const onCategoryChange = (categories: string[]) => onFilterChange("categories")(categories);

    const onSearchChange = (search: string) => onFilterChange("search")(search);

    return (
        // missing the flex-box part to make it pretty
        <div className="grid grid-cols-4">
            <DateFilter onDateRangeChange={onDateRangeChange} />
            <CategoryFilter onCategoryChange={onCategoryChange} possibleCategories={categories} />
            <DisasterRelatedFilter onTypeChange={onTypeChange} />
            <SearchBy onSearchChange={onSearchChange} />
        </div>
    );
}

function DateFilter({ onDateRangeChange }: { onDateRangeChange: (range: DateRange | undefined) => void }) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);

    const handleDateRangeSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        onDateRangeChange(range);
        // Close popover when both dates are selected
        if (range?.from && range?.to) {
            setIsOpen(false);
        }
    };

    const formatDateRange = () => {
        if (!dateRange?.from) {
            return "Select date range";
        }
        if (dateRange.from && !dateRange.to) {
            return `${dayjs(dateRange.from).format("MMM D, YYYY")} - ...`;
        }
        if (dateRange.from && dateRange.to) {
            return `${dayjs(dateRange.from).format("MMM D, YYYY")} - ${dayjs(dateRange.to).format("MMM D, YYYY")}`;
        }
        return "Select date range";
    };

    return (
        <div>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size={"sm"} className="w-full justify-start text-left font-normal">
                        {formatDateRange()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeSelect} numberOfMonths={2} />
                </PopoverContent>
            </Popover>
        </div>
    );
}

function DisasterRelatedFilter({ onTypeChange }: { onTypeChange: (type: PurchaseLineItemType) => void }) {
    return (
        <NativeSelect>
            <NativeSelectOption onClick={() => onTypeChange(PurchaseLineItemType.EXTRANEOUS)}>
                Disaster
            </NativeSelectOption>
            <NativeSelectOption onClick={() => onTypeChange(PurchaseLineItemType.TYPICAL)}>
                Non-Disaster
            </NativeSelectOption>
        </NativeSelect>
    );
}

function CategoryFilter({
    onCategoryChange,
    possibleCategories,
}: {
    onCategoryChange: (categories: string[]) => void;
    possibleCategories: string[];
}) {
    const initialCategories: string[] = [];
    const [selectedCategories, setCategories] = useState(initialCategories);

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setCategories(selectedCategories.filter((c: string) => c !== category));
        } else {
            setCategories([...selectedCategories, category]);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size={"sm"} variant={"outline"}>
                    All Categories
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {possibleCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => {
                            toggleCategory(category);
                            onCategoryChange([...selectedCategories]);
                        }}
                    >
                        {category}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SearchBy({ onSearchChange }: { onSearchChange: (search: string) => void }) {
    return (
        <Input
            className="h-8"
            type="search"
            placeholder="Search By..."
            onChange={(e) => onSearchChange(e.target.value)}
        />
    );
}
