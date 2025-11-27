"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface CategorySelectorProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    categories?: string[];
    categoryColors?: Record<string, string>;
}

const defaultCategories = ["Expenses", "Revenues", "Insurance"];

const defaultCategoryColors: Record<string, string> = {
    Expenses: "bg-[var(--light-fuchsia)] text-[var(--fuchsia)]",
    Revenues: "bg-[var(--light-teal)] text-[var(--teal)]",
    Insurance: "bg-[var(--gold)] text-[var(--deep-gold)]",
};

export default function CategorySelector({
    selectedCategory,
    onCategoryChange,
    categories = defaultCategories,
}: CategorySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const portalDropdownRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });



    useEffect(() => {
        setPortalRoot(document.getElementById("portal-root"));
      }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

    
    if (dropdownRef.current?.contains(target)) return;

  
    if (portalDropdownRef.current?.contains(target)) return;

    setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const filteredCategories = categories.filter((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleCategorySelect = (category: string) => {
        onCategoryChange(category);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleRemoveCategory = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCategoryChange("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Selected Category Display / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors min-h-[42px]"
            >
                {selectedCategory ? (
                    <div className="flex items-center gap-2 flex-1">
                        <span
                            className={`px-3 py-1 rounded-md text-sm font-medium ${defaultCategoryColors[selectedCategory] || "bg-gray-100 text-gray-700"}`}
                        >
                            {selectedCategory}
                        </span>
                        <button
                            onClick={handleRemoveCategory}
                            className="ml-auto text-gray-400 hover:text-gray-600 text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <span className="text-gray-400">Select a category</span>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && portalRoot &&
                createPortal(
                <div ref={portalDropdownRef} className=" top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-[999999] max-h-[400px] overflow-hidden"
                style={{
                    position: "absolute",
                    top: coords.top,
                    left: coords.left,
                    width: coords.width,
                }}>
                    {/* Search Input */}
                    <div className="p-4 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="Select an option or create one"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Category List */}
                    <div className="overflow-y-auto max-h-[300px]">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <div
                                    key={category}
                                    onClick={() => handleCategorySelect(category)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    {/* Drag Handle */}
                                    <div className="flex flex-col gap-[2px]">
                                        <div className="flex gap-[2px]">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        </div>
                                        <div className="flex gap-[2px]">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        </div>
                                        <div className="flex gap-[2px]">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Category */}
                                    <span
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${defaultCategoryColors[category] || "bg-gray-100 text-gray-700"}`}
                                    >
                                        {category}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                {searchQuery ? (
                                    <div>
                                        <p>No matching categories</p>
                                        <button
                                            onClick={() => {
                                                handleCategorySelect(searchQuery);
                                            }}
                                            className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                                        >
                                            Create &quot;{searchQuery}&quot;
                                        </button>
                                    </div>
                                ) : (
                                    "No categories available"
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ,portalRoot)}
        </div>
    );
}
