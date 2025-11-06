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
        <div className="w-full mb-[16px]">
            <div className="flex justify-between items-center">
                <div className="flex gap-[10px] items-center">
                    {!isExpanded ? (
                        <p className="text-[16px] font-bold">
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
                            className="bg-transparent placeholder:text-gray-400 placeholder:text-[16px] rounded-sm h-[35px]"
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
                            Save
                        </Button>
                    )}
                </div>
                <span onClick={removeLocation}>
                    <TrashCan />
                </span>
            </div>
            <hr className="my-[8px]" />
            {error ? <p className="text-red-400 mb-[16px]">{error}</p> : ""}
            {isExpanded ? (
                <div className="flex flex-col gap-[16px]">
                    <div className="flex flex-col gap-[8px] w-full">
                        <Label htmlFor="streetAddress" className="text-[16px]">
                            Street Address<span className="text-red-500 text-[16px]">*</span>
                        </Label>
                        <Input
                            id="streetAddress"
                            name="streetAddress"
                            type="text"
                            required
                            className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                            value={location.streetAddress ?? ""}
                            onChange={(e) => setLocation({ ...location, streetAddress: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-[16px]">
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="city" className="text-[16px]">
                                City<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="city"
                                name="city"
                                type="text"
                                required
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                value={location.city ?? ""}
                                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="state" className="text-[16px]">
                                State<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="state"
                                name="state"
                                type="text"
                                required
                                value={location.stateProvince ?? ""}
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                onChange={(e) => setLocation({ ...location, stateProvince: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-[16px]">
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="country" className="text-[16px]">
                                Country<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="country"
                                name="country"
                                type="text"
                                required
                                value={location.country ?? ""}
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                onChange={(e) => setLocation({ ...location, country: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-[8px] w-full">
                            <Label htmlFor="zip" className="text-[16px]">
                                Postal Code<span className="text-red-500 text-[16px]">*</span>
                            </Label>
                            <Input
                                id="zip"
                                name="zip"
                                type="text"
                                required
                                value={location.postalCode ?? ""}
                                className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                                onChange={(e) => setLocation({ ...location, postalCode: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-[16px]">
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
