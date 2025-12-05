import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { DisasterType } from "@/types/purchase";
import { DISASTER_TYPE_COLORS, DISASTER_TYPE_LABELS, DISASTER_TYPE_LABELS_TO_CHANGE } from "@/types/disaster";
import React from "react";

interface DisasterLabelProps {
    disasterType: DisasterType;
    updateDisasterType: (type: DisasterType, lineItems: string[]) => void;
    lineItemIds: string[];
    editableTags: boolean;
}

export default function DisasterLabel({
    disasterType,
    updateDisasterType,
    lineItemIds,
    editableTags,
}: DisasterLabelProps) {
    // purchases that do not contain any line items should not have an editable disaster type tag
    const isEditable = editableTags && lineItemIds.length > 0;
    if (!isEditable) {
        return <DisasterBadgeSpan type={disasterType} />;
    }

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Popover>
                <PopoverTrigger asChild>
                    <DisasterBadgeSpan type={disasterType} clickable={true} />
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                    <Command>
                        <div className="flex items-center border-b px-3 py-2 bg-muted/60">
                            <DisasterBadgeSpan type={disasterType} />
                        </div>
                        <div className="flex-1 text-sm text-black ml-2 pt-2 pb-1 px-1">Select an option</div>
                        <CommandGroup>
                            {Array.from(DISASTER_TYPE_LABELS_TO_CHANGE.keys()).map((type) => (
                                <CommandItem key={type} onSelect={() => updateDisasterType(type, lineItemIds)}>
                                    <DisasterBadgeSpan type={type} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

interface DisasterBadgeSpanProps {
    type: DisasterType;
    clickable?: boolean;
    children?: React.ReactNode;
}

export const DisasterBadgeSpan = React.forwardRef<HTMLSpanElement, DisasterBadgeSpanProps>(
    ({ type, clickable = false, children, ...props }, ref) => {
        const baseClasses = "px-2 py-1 rounded text-xs font-bold h-6 select-none";
        const clickableClass = clickable ? "cursor-pointer" : "";
        const colorClass = DISASTER_TYPE_COLORS.get(type);
        const label = DISASTER_TYPE_LABELS.get(type);
        return (
            <span ref={ref} {...props} className={`${baseClasses} ${clickableClass} ${colorClass}`}>
                {label}
                {children}
            </span>
        );
    }
);

DisasterBadgeSpan.displayName = "DisasterBadgeSpan";
