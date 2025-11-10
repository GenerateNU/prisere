import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PurchaseLineItemType } from "@/types/purchase";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import dayjs from "dayjs";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Cloud } from "lucide-react";

export function Filters({
    onFilterChange,
    allCategories,
    selectedCategories,
}: {
    onFilterChange: (field: string) => (value: unknown) => void;
    allCategories: string[];
    selectedCategories: string[];
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

    const onTypeChange = (type?: PurchaseLineItemType) => onFilterChange("type")(type);

    const onCategoryChange = (categories: string[]) => {
        onFilterChange("categories")(categories);
    }

    const onSearchChange = (search: string) => onFilterChange("search")(search);

    return (
        <div className="grid grid-cols-4">
            <DateFilter onDateRangeChange={onDateRangeChange} />
            <CategoryFilter onCategoryChange={onCategoryChange} possibleCategories={allCategories} selectedCategories={selectedCategories} />
            <DisasterRelatedFilter onTypeChange={onTypeChange} />
            <SearchBy onSearchChange={onSearchChange} />
        </div>
    );
}

const dateOptions = new Map<string, Date>([
    ["Today", new Date()],
    ["Yesterday", new Date(new Date().setDate(new Date().getDate() - 1))],
    ["This Week", new Date(new Date().setDate(new Date().getDate() - new Date().getDay()))],
    ["This Month", new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
]);

function DateFilter({ onDateRangeChange }: { onDateRangeChange: (range: DateRange | undefined) => void }) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange>();
    const [selected, setSelected] = useState<string>();

    const handleSelect = (option: string, date: Date) => {
        if (selected === option) {
            setSelected(undefined);
            setDateRange(undefined);
            onDateRangeChange(undefined);
            return;
        } else {
            setSelected(option);
            const range = { from: date, to: new Date() };
            setDateRange(range);
            onDateRangeChange(range);
        }
    };

    const handleCustom = () => {
        if (selected === "Custom") {
            setSelected(undefined);
            setDateRange(undefined);
            onDateRangeChange(undefined);
            setIsCalendarOpen(false);
        } else {
            setSelected("Custom");
            setIsCalendarOpen(true);
        }
    };

    const handleCalendarSelect = (range: DateRange | undefined) => {
        setDateRange(range);
        onDateRangeChange(range);
        if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
            setIsCalendarOpen(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                        All Dates
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {[...dateOptions].map(([option, date]) => (
                        <DropdownMenuItem key={option} onClick={() => handleSelect(option, date)}>
                            {option}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={handleCustom}>Custom</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            {isCalendarOpen && (
                <div className="absolute z-50 mt-2">
                    <div className="rounded-md border bg-popover p-0 shadow-md">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={handleCalendarSelect}
                            numberOfMonths={2}
                            disabled={(date) => {
                                if (date > new Date()) return true;
                                if (dateRange?.from && !dateRange?.to) {
                                    return date <= dateRange.from;
                                }
                                return false;
                            }}/>
                    </div>
                </div>
            )}
        </>
    );
}

function DisasterRelatedFilter({ onTypeChange }: { onTypeChange: (type: PurchaseLineItemType | undefined) => void }) {
    const [selected, setSelected] = useState<PurchaseLineItemType | undefined>(undefined);

    const handleSelect = (type: PurchaseLineItemType | undefined) => {
        setSelected(type);
        onTypeChange(type);
    };


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Disaster Related
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleSelect(undefined)}>
                    All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect(PurchaseLineItemType.EXTRANEOUS)}>
                    Disaster
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect(PurchaseLineItemType.TYPICAL)}>
                    Non-Disaster
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function CategoryFilter({
    onCategoryChange,
    possibleCategories,
    selectedCategories,
}: {
    onCategoryChange: (categories: string[]) => void;
    possibleCategories: string[];
    selectedCategories: string[];
}) {
    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoryChange(selectedCategories.filter((c: string) => c !== category));
        } else {
            onCategoryChange([...selectedCategories, category]);
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
