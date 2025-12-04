import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDate } from "date-fns";
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export function Filters({
    dateRange,
    onDateRangeChange,
    search,
    onSearchChange,
}: {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
    search: string | undefined;
    onSearchChange: (range: string | undefined) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <DateFilter dateRange={dateRange} onDateRangeChange={onDateRangeChange} />
            <SearchFilter search={search} onSearchChange={onSearchChange} />
        </div>
    );
}

const dateOptions = new Map<string, Date>([
    ["Today", new Date()],
    ["Yesterday", new Date(new Date().setDate(new Date().getDate() - 1))],
    ["This Week", new Date(new Date().setDate(new Date().getDate() - new Date().getDay()))],
    ["This Month", new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
]);

function formatDateRange(dateRange: DateRange) {
    if (dateRange.from && dateRange.to) {
        return `${formatDate(dateRange.from, "MM/dd/yyyy")} - ${formatDate(dateRange.to, "MM/dd/yyyy")}`;
    }
    if (dateRange.from) {
        return formatDate(dateRange.from, "MM/dd/yyyy");
    }

    if (dateRange.to) {
        return formatDate(dateRange.to, "MM/dd/yyyy");
    }

    return "";
}

function DateFilter({
    dateRange,
    onDateRangeChange,
}: {
    dateRange: DateRange | undefined;
    onDateRangeChange: (range: DateRange | undefined) => void;
}) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selected, setSelected] = useState<string>();

    const handleSelect = (option: string, date: Date) => {
        if (selected === option) {
            setSelected(undefined);
            onDateRangeChange(undefined);
            return;
        } else {
            setSelected(option);
            const range = { from: date, to: new Date() };
            onDateRangeChange(range);
        }
    };

    const handleCustom = () => {
        if (selected === "Custom") {
            setSelected(undefined);
            onDateRangeChange(undefined);
            setIsCalendarOpen(false);
        } else {
            setSelected("Custom");
            setIsCalendarOpen(true);
        }
    };

    const handleCalendarSelect = (range: DateRange | undefined) => {
        onDateRangeChange(range);
        if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
            setIsCalendarOpen(false);
        }
    };

    const label = selected
        ? selected === "Custom" && dateRange
            ? `Custom (${formatDateRange(dateRange)})`
            : selected
        : "All Dates";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        size="sm"
                        className="h-[34px] px-2 w-fit justify-between gap-2 rounded-full bg-muted text-black text-sm  hover:bg-muted/80 aria-expanded:border"
                    >
                        <div className="flex items-center gap-2">
                            <CalendarIcon style={{ height: "16px", width: "16px", strokeWidth: "1px" }} />
                            <span className="truncate">{label}</span>
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

function SearchFilter({
    search,
    onSearchChange,
}: {
    search: string | undefined;
    onSearchChange: (search: string | undefined) => void;
}) {
    return (
        <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            <Input
                placeholder="Search"
                value={search ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 w-full pl-8 pr-3 rounded-full bg-muted text-black text-sm placeholder:text-sm placeholder:text-black border-0 outline-none"
            />
        </div>
    );
}
