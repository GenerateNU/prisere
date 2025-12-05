import { ChevronDown, MapIcon } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { GetCompanyLocationsResponse } from "@/types/company";

interface LocationsDropDownProps {
    availableLocations: GetCompanyLocationsResponse;
    selectedLocation: GetCompanyLocationsResponse[number] | undefined;
    handleSelect: (selectedLocation: GetCompanyLocationsResponse[number]) => void;
}

export const LocationsDropDown = ({ availableLocations, handleSelect, selectedLocation }: LocationsDropDownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-[60%] flex gap-2 rounded-full bg-muted text-black text-[20px] border border-border/40 hover:bg-muted/80 justify-between"
                >
                    <div className="flex items-center gap-1">
                        <span className="truncate">
                            {selectedLocation ? `${selectedLocation.city} - ${selectedLocation.alias}` : ""}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96" align="start">
                {[...availableLocations].map((item) => (
                    <DropdownMenuItem key={item.id} onClick={() => handleSelect(item)}>
                        {`${item.city} - ${item.alias}`}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
