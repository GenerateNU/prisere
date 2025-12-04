"use client";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { LuShapes } from "react-icons/lu";

type BusinessDocumentFiltersProps = {
    dateFilter: string;
    categoryFilter: string;
    searchQuery: string;
    setDateFilter: (value: string) => void;
    setCategoryFilter: (value: string) => void;
    setSearchQuery: (value: string) => void;
};
export default function BusinessDocumentFilters({
    dateFilter,
    categoryFilter,
    searchQuery,
    setDateFilter,
    setCategoryFilter,
    setSearchQuery,
}: BusinessDocumentFiltersProps) {
    const categories = ["All Categories", "Insurance", "Revenues", "Expenses"];
    const dateOptions = ["All Dates", "Today", "This Week", "This Month", "This Year", "Custom"];

    return (
        <div className="flex justify-between">
            <Select value={dateFilter} onValueChange={(e) => setDateFilter(e)}>
                <SelectTrigger
                    style={{
                        width: "15%",
                        height: "35px",
                        borderRadius: "40px",
                        fontSize: "14px",
                        backgroundColor: "var(--slate)",
                        border: "none",
                        boxShadow: "none",
                    }}
                >
                    <CalendarIcon className="text-black stroke-1" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {dateOptions.map((date) => (
                        <SelectItem key={date} value={date} className="">
                            {date}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(e) => setCategoryFilter(e)}>
                <SelectTrigger
                    style={{
                        width: "22%",
                        height: "35px",
                        borderRadius: "40px",
                        fontSize: "14px",
                        backgroundColor: "var(--slate)",
                        border: "none",
                        boxShadow: "none",
                    }}
                >
                    <LuShapes className="text-black stroke-1" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((category) => (
                        <SelectItem key={category} value={category} className="">
                            {category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputGroup className="w-[62%] h-[35px] text-[14px] border-none shadow-none bg-[var(--slate)] rounded-full">
                <InputGroupInput
                    type="text"
                    placeholder="Search by..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-[14px] placeholder:text-[14px]"
                />
                <InputGroupAddon>
                    <Search className="text-black stroke-1" />
                </InputGroupAddon>
            </InputGroup>
        </div>
    );
}
