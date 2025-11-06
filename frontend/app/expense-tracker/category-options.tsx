import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { X } from "lucide-react";


export default function CategoryLabel(
    {
        category,
        onCategoryChange,
        addCategory,
        lineItemIds,
    }: {
        category: string;
        onCategoryChange: () => void;
        addCategory: (category: string, lineItems: string[]) => Promise<void>;
        lineItemIds: string[];
    }) {
    const categories = category.split(",").map(c => c.trim()).filter(Boolean);

    return (
        <>
            {categories.slice(0, 3).map((catToLabel, index) => {
                const color = "red"; // tailwind is not working for me
                return (
                    <Popover key={index}>
                        <PopoverTrigger asChild>
                            <span
                                className="px-3 py-1 rounded-full text-sm font-medium cursor-pointer"
                                style={{ backgroundColor: color }}
                            >
                                {catToLabel}
                            </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <div className="flex items-center justify-between p-2 border-b">
                                <span className="font-medium">{catToLabel}</span>
                                <button
                                    onClick={async () => {
                                        // make this patch caller
                                        // await patch endpoint does not have option to remove category FIX
                                        onCategoryChange();
                                    }}
                                    className="hover:bg-gray-100 rounded-full p-1"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <Command>
                                <CommandInput placeholder="Select or create..." />
                                <CommandEmpty>Create new</CommandEmpty>
                                <CommandGroup>
                                    {categories.map((cat) => (
                                        <CommandItem
                                            key={cat}
                                            onSelect={async () => {
                                                await addCategory(cat, lineItemIds);
                                                onCategoryChange();
                                            }}
                                        >
                                            {cat}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                );
            })}
            {categories.length > 3 && (
                <span className="px-3 py-1 rounded-full text-sm font-medium">
                    ...
                </span>
            )}
        </>
    );
}