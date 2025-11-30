import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface CategoryLabelProps {
    category: string;
    updateCategory?: (category: string, lineItems: string[], removeCategory: boolean) => void;
    lineItemIds: string[];
    editableTags: boolean;
}

interface CategoryBadgeProps extends CategoryLabelProps {
    allCategories: string[];
}

interface CreateCategoryProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    updateCategory: (category: string, lineItems: string[], removeCategory: boolean) => void;
    lineItemIds: string[];
}

export default function CategoryLabel({ category, updateCategory, lineItemIds, editableTags }: CategoryLabelProps) {
    const categories = category.length > 0 ? category.split(",") : [];

    if (editableTags && updateCategory && categories.length === 0) {
        return (
            <div className="inline-flex flex-wrap items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {lineItemIds.length > 0 ? (
                    <AddCategoryButton />
                ) : (
                    <span className="text-muted-foreground text-xs italic">No line items to categorize</span>
                )}
            </div>
        );
    }

    return (
        <div className="inline-flex flex-wrap items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {categories.slice(0, 3).map((cat, index) => (
                <CategoryBadge
                    key={index}
                    category={cat}
                    allCategories={categories}
                    updateCategory={updateCategory}
                    lineItemIds={lineItemIds}
                    editableTags={editableTags}
                />
            ))}
            {categories.length > 3 && <span className="px-3 py-1 text-sm">...</span>}
        </div>
    );

    function AddCategoryButton() {
        const [searchValue, setSearchValue] = useState("");
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button className="text-gray-400 text-sm hover:text-gray-600 underline">+ Add category</button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-4">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Enter category name..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            maxLength={100}
                            inputMode="text"
                            className="h-8 w-full rounded-full bg-muted text-black text-sm border border-border/40 px-3
                            focus-visible:ring-1 focus-visible:ring-ring/40
                            placeholder:text-xs placeholder:text-black
                            [&::placeholder]:text-xs [&::placeholder]:text-black"
                        />
                        <Create
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            updateCategory={updateCategory!}
                            lineItemIds={lineItemIds}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        );
    }
}

export function CategoryBadge({
    category,
    allCategories,
    updateCategory,
    lineItemIds,
    editableTags,
}: CategoryBadgeProps) {
    const [searchValue, setSearchValue] = useState("");
    const displayCategory = category.length > 20 ? `${category.substring(0, 20)}...` : category;

    if (!editableTags || !updateCategory) {
        return (
            <span
                className="px-[8px] py-[4px] rounded-[4px] text-[12px] font-bold h-[24px] inline-block"
                style={{ backgroundColor: getTagColor(category).backgroundColor }}
            >
                {displayCategory}
            </span>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <span
                    className="px-[8px] py-[4px] rounded-[4px] text-[12px] h-[24px] font-bold cursor-pointer inline-block"
                    style={{ backgroundColor: getTagColor(category).backgroundColor }}
                >
                    {displayCategory}
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <div className="flex items-center gap-2 border-b bg-muted/60 px-2 py-0" cmdk-input-wrapper="">
                        <span
                            className="flex items-center gap-1 px-[8px] py-[4px] h-[24px] rounded-[4px] text-[12px] font-bold text-black flex-shrink-0"
                            style={getTagColor(category)}
                        >
                            {category}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateCategory(category, lineItemIds, true);
                                }}
                                className="hover:bg-gray-100 hover:bg-opacity-20 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                        <div
                            className="flex-1
                            [&_[data-slot=command-input-wrapper]]:border-0
                            [&_[data-slot=command-input-wrapper]]:px-0
                            [&_[data-slot=command-input-wrapper]]:h-auto
                            [&_svg]:hidden"
                        >
                            <CommandInput
                                value={searchValue}
                                onValueChange={(value) => {
                                    if (value.length <= 100) {
                                        setSearchValue(value);
                                    }
                                }}
                                className="overflow-hidden border-0 px-0 flex-1"
                                inputMode="text"
                            />
                        </div>
                    </div>
                    <div className="px-3 py-0.5 text-xs text-muted-foreground border-b">
                        Select an option or create one
                    </div>
                    <CommandEmpty>
                        <Create
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            updateCategory={updateCategory}
                            lineItemIds={lineItemIds}
                        />
                    </CommandEmpty>
                    <CommandGroup>
                        {allCategories.map((cat) => (
                            <CommandItem
                                key={cat}
                                onSelect={() => updateCategory(cat, lineItemIds, false)}
                                className="flex items-center gap-2"
                            >
                                <span
                                    className="px-[8px] py-[4px] h-[24px] rounded-[4px] text-[12px] font-bold text-black"
                                    style={getTagColor(cat)}
                                >
                                    {cat}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function Create({ searchValue, updateCategory, lineItemIds, setSearchValue }: CreateCategoryProps) {
    const displayText = searchValue.length > 15 ? `${searchValue.substring(0, 15)}...` : searchValue;

    return (
        <button
            type="button"
            className="relative mt-1 flex cursor-pointer select-none items-center rounded-sm px-2 py-0.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
                const name = searchValue.trim();
                if (name) {
                    updateCategory(name, lineItemIds, false);
                    setSearchValue("");
                }
            }}
        >
            Create {displayText}
        </button>
    );
}

const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 60;

    return {
        backgroundColor: `hsl(${hue}, 60%, 85%)`,
        color: "#000000",
        borderColor: `hsl(${hue}, 60%, 70%)`,
    };
};
