import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PurchaseLineItemType } from "@/types/purchase";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Search, ChevronDown } from "lucide-react";
import { WiRainMix } from "react-icons/wi";
import { LuShapes } from "react-icons/lu";

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
    };

    const onSearchChange = (search: string) => onFilterChange("search")(search);

    return (
        <div className="flex w-full flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[150px]">
                <DateFilter onDateRangeChange={onDateRangeChange} />
            </div>
            <div className="flex-1 min-w-[150px]">
                <CategoryFilter
                    onCategoryChange={onCategoryChange}
                    possibleCategories={allCategories}
                    selectedCategories={selectedCategories}
                />
            </div>
            <div className="flex-1 min-w-[150px]">
                <DisasterRelatedFilter onTypeChange={onTypeChange} />
            </div>
            <div className="flex-[2.5] min-w-[250px]">
                <SearchBy onSearchChange={onSearchChange} />
            </div>
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
                    <Button
                        size="sm"
                        className="h-[34px] px-2 w-full justify-between gap-2 rounded-full bg-muted text-black text-sm  hover:bg-muted/80 aria-expanded:border"
                    >
                        <div className="flex items-center gap-2">
                            <CalendarIcon style={{ height: "16px", width: "16px", strokeWidth: "1px" }} />
                            <span className="truncate">All Dates</span>
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-70" />
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
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

function DisasterRelatedFilter({ onTypeChange }: { onTypeChange: (type: PurchaseLineItemType | undefined) => void }) {
    const handleSelect = (type: PurchaseLineItemType | undefined) => {
        onTypeChange(type);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="sm"
                    className="h-[34px] w-full justify-between px-2 gap-2 rounded-full bg-muted text-black text-sm hover:bg-muted/80 aria-expanded:border"
                >
                    <div className="flex items-center gap-2">
                        <WiRainMix style={{ height: "20px", width: "20px" }} />
                        <span className="truncate">Disaster Related</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleSelect(undefined)}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect(PurchaseLineItemType.EXTRANEOUS)}>
                    Disaster
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect(PurchaseLineItemType.TYPICAL)}>
                    Non-Disaster
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect(PurchaseLineItemType.PENDING)}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect(PurchaseLineItemType.SUG_EX)}>
                    Suggested: Disaster
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelect(PurchaseLineItemType.SUG_TY)}>
                    Suggested: Non-Disaster
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
                <Button
                    size="sm"
                    className="h-[34px] w-full justify-between px-2 gap-2 rounded-full bg-muted text-black text-sm  hover:bg-muted/80 aria-expanded:border"
                >
                    <div className="flex items-center gap-2">
                        <LuShapes style={{ height: "20px", width: "20px", strokeWidth: "1px" }} />
                        <span className="truncate">All Categories</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-70" />
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
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <Input
                className="
          !h-8
          !pl-8 !pr-3
          !rounded-full
          !bg-muted
          !text-black !text-sm
          placeholder:!text-sm placeholder:text-black
          border-none
          !h-[32px]
        "
                type="search"
                placeholder="Search By..."
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    );
}
