import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DISASTER_TYPE_COLORS, DISASTER_TYPE_LABELS, DISASTER_TYPE_LABELS_TO_CHANGE } from "@/types/disaster";
import { DisasterType } from "@/types/purchase";

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
    const displayType = DISASTER_TYPE_LABELS.get(disasterType);

    if (!editableTags) {
        return (
            <span
                className={`px-[8px] py-[4px] rounded-[4px] text-[12px] h-[24px] font-bold ${DISASTER_TYPE_COLORS.get(disasterType)}`}
            >
                {displayType}
            </span>
        );
    }

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Popover>
                <PopoverTrigger asChild>
                    <span
                        className={`px-[8px] py-[4px] rounded-[4px] text-[12px] font-bold h-[24px] cursor-pointer ${DISASTER_TYPE_COLORS.get(disasterType)}`}
                    >
                        {displayType}
                    </span>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                    <Command>
                        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <span
                                className={`flex items-center gap-1 px-[8px] py-[4px] rounded-[4px] text-[12px] font-bold mr-2 flex-shrink-0 h-[24px] ${DISASTER_TYPE_COLORS.get(disasterType)}`}
                            >
                                {displayType}
                            </span>
                            <div className="flex-1 text-sm text-gray-500 py-3">Select an option</div>
                        </div>
                        <CommandGroup>
                            {Array.from(DISASTER_TYPE_LABELS_TO_CHANGE.keys()).map((type) => (
                                <CommandItem key={type} onSelect={() => updateDisasterType(type, lineItemIds)}>
                                    <span
                                        className={`px-[8px] py-[4px] rounded-[4px] text-[12px] h-[24px] font-bold ${DISASTER_TYPE_COLORS.get(type)}`}
                                    >
                                        {DISASTER_TYPE_LABELS.get(type)}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
