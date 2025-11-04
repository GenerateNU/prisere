import EditPencil from "@/icons/EditPencil";
import TrashCan from "@/icons/TrashCan";
import { CreateLocationRequest } from "@/types/location";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import React from "react";

interface LocationEditorProps {
    location: CreateLocationRequest;
    setLocation: (location: CreateLocationRequest) => void;
    removeLocation: () => void;
    isExpanded?: boolean;
    onExpand: () => void;
    onCollapse: () => void;
}

export default function LocationEditor({
    location,
    setLocation,
    removeLocation,
    isExpanded,
    onExpand,
    onCollapse,
}: LocationEditorProps) {
    const [error, setError] = React.useState<string | null>(null);
    const handleCollapse = () => {
        if (
            !location.alias ||
            !location.streetAddress ||
            !location.city ||
            !location.stateProvince ||
            !location.postalCode ||
            !location.country
        ) {
            setError("Please fill in all required fields before saving.");
            return;
        }
        setError(null);
        onCollapse();
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center">
                <div className="flex gap-[10px] items-center">
                    {!isExpanded ? (
                        <p className="text-[24px] font-bold">
                            {location.alias !== "" ? location.alias : "Location Name"}
                        </p>
                    ) : (
                        <Input
                            id="alias"
                            name="alias"
                            type="text"
                            placeholder="Location Name"
                            value={location.alias}
                            required
                            className="bg-transparent placeholder:text-gray-400 rounded-sm h-[35px]"
                            onChange={(e) => setLocation({ ...location, alias: e.target.value })}
                        />
                    )}
                    {!isExpanded ? (
                        <span onClick={onExpand}>
                            <EditPencil />
                        </span>
                    ) : (
                        <Button
                            variant="link"
                            className="p-0 text-[14px] w-fit h-fit underline"
                            onClick={handleCollapse}
                        >
                            Collapse
                        </Button>
                    )}
                </div>
                <span onClick={removeLocation}>
                    <TrashCan />
                </span>
            </div>
            <hr className="mt-[16px] mb-[16px]" />
            {error ? <p className="text-red-400 mb-[16px]">{error}</p> : ""}
            {isExpanded ? (
                <div className="flex flex-col gap-[16px]">
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="streetAddress" className="text-[20px]">
                            Street Address<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="streetAddress"
                            name="streetAddress"
                            type="text"
                            required
                            value={location.streetAddress ?? ""}
                            onChange={(e) => setLocation({ ...location, streetAddress: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="city" className="text-[20px]">
                            City<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="city"
                            name="city"
                            type="text"
                            required
                            value={location.city ?? ""}
                            onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="state" className="text-[20px]">
                            State<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="state"
                            name="state"
                            type="text"
                            required
                            value={location.stateProvince ?? ""}
                            onChange={(e) => setLocation({ ...location, stateProvince: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="zip" className="text-[20px]">
                            Postal Code<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="zip"
                            name="zip"
                            type="text"
                            required
                            value={location.postalCode ?? ""}
                            onChange={(e) => setLocation({ ...location, postalCode: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[16px] w-full">
                        <Label htmlFor="country" className="text-[20px]">
                            Country<span className="text-red-500 text-[20px]">*</span>
                        </Label>
                        <Input
                            id="country"
                            name="country"
                            type="text"
                            required
                            value={location.country ?? ""}
                            onChange={(e) => setLocation({ ...location, country: e.target.value })}
                        />
                    </div>
                </div>
            ) : (
                <div>
                    <p>{location.streetAddress}</p>
                    <p>
                        {location.city}, {location.stateProvince} {location.postalCode}
                    </p>
                    <p>{location.country}</p>
                </div>
            )}
        </div>
    );
}
