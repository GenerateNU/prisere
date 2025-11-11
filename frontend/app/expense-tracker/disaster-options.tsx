import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";

export type DisasterType = 'typical' | 'extraneous';

interface DisasterLabelProps {
    disasterType: DisasterType;
    updateDisasterType: (type: DisasterType, lineItems: string[]) => void;
    lineItemIds: string[];
    editableTags: boolean
}

const DISASTER_TYPE_LABELS = new Map<DisasterType, string>([
    ["typical", "Non-Disaster"],
    ["extraneous", "Disaster"],
]);

const DISASTER_TYPE_COLORS = new Map([
    ["typical", "bg-teal-100 text-teal-800 border border-teal-200"],
    ["extraneous", "bg-pink-100 text-pink-800 border border-pink-200"],
]);

export default function DisasterLabel({ disasterType, updateDisasterType, lineItemIds, editableTags }: DisasterLabelProps) {
    const displayType = DISASTER_TYPE_LABELS.get(disasterType);

    if (!editableTags) {
        return (
            <span className={`px-3 py-1 rounded-md text-sm font-semibold ${DISASTER_TYPE_COLORS.get(disasterType)}`}>
                {displayType}
            </span>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <span className={`px-3 py-1 rounded-md text-sm font-semibold cursor-pointer ${DISASTER_TYPE_COLORS.get(disasterType)}`}>
                    {displayType}
                </span>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold mr-2 flex-shrink-0 ${DISASTER_TYPE_COLORS.get(disasterType)}`}>
                            {displayType}
                        </span>
                        <div className="flex-1 text-sm text-gray-500 py-3">
                            Select an option
                        </div>
                    </div>
                    <CommandGroup>
                        {Array.from(DISASTER_TYPE_LABELS.keys()).map((type) => (
                            <CommandItem key={type} onSelect={() => updateDisasterType(type, lineItemIds)}>
                                <span className={`px-3 py-1 rounded-md text-xs font-semibold ${DISASTER_TYPE_COLORS.get(type)}`}>
                                    {DISASTER_TYPE_LABELS.get(type)}
                                </span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}