import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PurchaseLineItemType } from "../../api/purchase";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

const dateOptions = ["Today", "Yesterday", "This Week", "This Month"];
const dateMap = new Map<string, Date>([
    ["Today", new Date()],
    ["Yesterday", new Date(new Date().setDate(new Date().getDate() - 1))],
    ["This Week", new Date(new Date().setDate(new Date().getDate() - new Date().getDay()))],
    ["This Month", new Date(new Date().getFullYear(), new Date().getMonth(), 1)],
]);

export default function Filters({ onFilterChange }: {
    onFilterChange: (field: string) => (value: any) => void }) {

    const onDateChange =
        (startDate: Date) => onFilterChange("dateFrom")(startDate.toISOString());

    const onTypeChange =
        (type: PurchaseLineItemType) => onFilterChange("type")(type);



    return (
        // missing the flex-box part to make it pretty
        <>
            <DateFilter onDateChange={onDateChange}></DateFilter>
            <CategoryFilter></CategoryFilter>
            <DisasterRelatedFilter onTypeChange={onTypeChange}></DisasterRelatedFilter>
        </>

    );

}

function DateFilter({ onDateChange }: {
    onDateChange: (dateFrom: Date) => void }) {
    return (
        <>
            <NativeSelect>
                {dateOptions.map((val) => (
                    <NativeSelectOption
                        // for all dates where dateTo is the present
                        onClick={() => onDateChange(dateMap.get(val)!)}
                    >
                        {val}
                    </NativeSelectOption>
                ))}
                <NativeSelectOption>
                    Custom - need to implement date selection
                </NativeSelectOption>
            </NativeSelect>
        </>
    );
}

function DisasterRelatedFilter({ onTypeChange }: {
    onTypeChange: (type: PurchaseLineItemType) => void })  {
    return (
        <NativeSelect>
            <NativeSelectOption
                onClick={() => onTypeChange(PurchaseLineItemType.EXTRANEOUS)}>
                Disaster
            </NativeSelectOption>
            <NativeSelectOption
                onClick={() => onTypeChange(PurchaseLineItemType.TYPICAL)}>
                Non-Disaster
            </NativeSelectOption>
        </NativeSelect>
    );
}

function CategoryFilter({ onCategoryChange, possibleCategories }: {
    onCategoryChange: (categories: string[]) => void,
    possibleCategories : string[]}) {
    const initialCategories: string[] = []
    const [selectedCategories, setCategories] = useState(initialCategories);

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setCategories(selectedCategories.filter(((c: string) => c !== category)));
        } else {
            setCategories([...selectedCategories, category]);
        }
    }

    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button>
                    All Categories
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {possibleCategories.map((category) => (
                    <DropdownMenuCheckboxItem
                        key={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => {
                            toggleCategory(category)
                            onCategoryChange([...selectedCategories])
                        }}
                    >
                        {category}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}