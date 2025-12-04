import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { X } from "lucide-react";
import { useState } from "react";
import React from "react";

const CATEGORY_MAX_CHARS = 20;

interface CategoryLabelProps {
    category: string;
    updateCategory?: (category: string, lineItems: string[], removeCategory: boolean) => void;
    lineItemIds: string[];
    editableTags: boolean;
    allCategories?: string[];
}

interface CreateCategoryProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    updateCategory: (category: string, lineItems: string[], removeCategory: boolean) => void;
    lineItemIds: string[];
}

interface CategoryBadgeSpanProps {
    category: string;
    variant?: "default" | "flex";
    clickable?: boolean;
    children?: React.ReactNode;
}

export const CategoryBadgeSpan = React.forwardRef<HTMLSpanElement, CategoryBadgeSpanProps>(
    ({ category, variant = "default", clickable = false, children, ...props }, ref) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-bold h-6 select-none";
        const variantClasses = variant === "flex" ? "flex items-center gap-1 flex-shrink-0" : "inline-block";
        const clickableClass = clickable ? "cursor-pointer" : "";

        const displayText =
            category.length > CATEGORY_MAX_CHARS ? `${category.substring(0, CATEGORY_MAX_CHARS)}...` : category;

        return (
            <span
                ref={ref}
                {...props}
                className={`${baseClasses} ${variantClasses} ${clickableClass} text-black`}
                style={{ backgroundColor: getTagColor(category).backgroundColor }}
            >
                {displayText}
                {children}
            </span>
        );
    }
);

CategoryBadgeSpan.displayName = "CategoryBadgeSpan";

export default function CategoryLabel({
    category,
    updateCategory,
    lineItemIds,
    editableTags,
    allCategories,
}: CategoryLabelProps) {
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
        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {categories.slice(0, 3).map((cat, index) => (
                <CategoryBadge
                    key={index}
                    category={cat}
                    allCategories={allCategories}
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
                <PopoverContent className="w-64 p-0">
                    <CategoryCommand
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        updateCategory={updateCategory!}
                        lineItemIds={lineItemIds}
                        allCategories={allCategories ?? []}
                    />
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
}: CategoryLabelProps) {
    const [searchValue, setSearchValue] = useState("");

    if (!editableTags || !updateCategory || !allCategories) {
        return <CategoryBadgeSpan category={category} />;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <CategoryBadgeSpan category={category} clickable={true} />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
                <CategoryCommand
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    updateCategory={updateCategory}
                    lineItemIds={lineItemIds}
                    allCategories={allCategories}
                    headerContent={
                        <CategoryBadgeSpan category={category} variant="flex">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    updateCategory(category, lineItemIds, true);
                                }}
                                className="hover:bg-gray-100 hover:bg-opacity-20 rounded-full p-0.5 ml-1"
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </CategoryBadgeSpan>
                    }
                />
            </PopoverContent>
        </Popover>
    );
}

interface CategoryCommandProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    updateCategory: (category: string, lineItems: string[], removeCategory: boolean) => void;
    lineItemIds: string[];
    allCategories: string[];
    headerContent?: React.ReactNode;
}

function CategoryCommand({
    searchValue,
    setSearchValue,
    updateCategory,
    lineItemIds,
    allCategories,
    headerContent,
}: CategoryCommandProps) {
    return (
        <Command>
            <div className="flex items-center gap-2 border-b bg-muted/60 px-2 py-0" cmdk-input-wrapper="">
                {headerContent}
                <div
                    className="flex-1 [&_[data-slot=command-input-wrapper]]:border-0
                [&_[data-slot=command-input-wrapper]]:px-0 [&_[data-slot=command-input-wrapper]]:h-auto [&_svg]:hidden"
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
            <div className="px-3 py-2 text-sm text-black">Select an option or create one</div>
            <CommandEmpty className="py-0 pb-0.5">
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
                        <CategoryBadgeSpan category={cat} />
                    </CommandItem>
                ))}
            </CommandGroup>
        </Command>
    );
}

function Create({ searchValue, updateCategory, lineItemIds, setSearchValue }: CreateCategoryProps) {
    const previewColor = {
        backgroundColor: "hsl(0, 0%, 85%)",
        color: "#000000",
    };

    const displayText =
        searchValue.length > CATEGORY_MAX_CHARS ? `${searchValue.substring(0, CATEGORY_MAX_CHARS)}...` : searchValue;

    return (
        <button
            type="button"
            className="relative w-full flex cursor-pointer select-none items-center gap-2 rounded-sm px-3 py-1.5 text-sm
             outline-none hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
                const name = searchValue.trim();
                if (name) {
                    updateCategory(name, lineItemIds, false);
                    setSearchValue("");
                }
            }}
        >
            <span className="text-sm text-black">Create</span>
            <span className="px-2 py-1 rounded text-xs font-bold h-6 inline-block text-black" style={previewColor}>
                {displayText}
            </span>
        </button>
    );
}

const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = hash % 360;

    return {
        backgroundColor: `hsl(${hue}, 60%, 85%)`,
        color: "#000000",
        borderColor: `hsl(${hue}, 60%, 70%)`,
    };
};
