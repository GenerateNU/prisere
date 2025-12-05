import { cn } from "@/lib/utils";
import { CreateLocationRequest, UpdateLocationRequest } from "@/types/location";
import React from "react";
import { FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi2";
import { IoCheckmark } from "react-icons/io5";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LocationEditorProps {
    location: CreateLocationRequest | UpdateLocationRequest;
    setLocation: (location: CreateLocationRequest | UpdateLocationRequest) => void;
    removeLocation: () => void;
    isExpanded?: boolean;
    onExpand: () => void;
    onCollapse: () => void;
    saveError?: string | null;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function LocationEditor({
    location,
    isSelected,
    onClick,
    setLocation,
    removeLocation,
    isExpanded,
    onExpand,
    onCollapse,
    saveError = null,
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
        <Card
            className={cn(
                "w-full mb-[16px] px-[28px] py-[20px] border shadow-none",
                isSelected && "border-fuchsia",
                onClick && "cursor-pointer"
            )}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex gap-[10px] items-center w-3/4">
                    {!isExpanded && (
                        <p className="text-[16px] font-bold">
                            {location.alias !== "" ? location.alias : "Location Name"}
                        </p>
                    )}
                </div>
                <div className="flex gap-[8px] self-start">
                    <Button
                        onClick={() => {
                            if (isExpanded) {
                                handleCollapse();
                            } else {
                                onExpand();
                            }
                        }}
                        style={{ paddingInline: 0 }}
                        className={`group p-0 flex items-center justify-center h-[35px] w-[35px] ${isExpanded ? "bg--fuchsia hover:bg-pink hover:text-fuchsia" : "bg--slate hover:bg-fuchsia hover:text-white"}`}
                    >
                        <FiEdit className={`${isExpanded ? "text-white group-hover:text-fuchsia" : "text-black group-hover:text-white"} text-[20px]`} />
                    </Button>
                    <Button
                        onClick={removeLocation}
                        style={{ paddingInline: 0 }}
                        className="group p-0 flex items-center justify-center h-[35px] w-[35px] bg--slate hover:bg-fuchsia hover:text-white"
                    >
                        <HiOutlineTrash className="group-hover:text-white" />
                    </Button>
                </div>
            </div>
            {!isExpanded && <hr className="mt-[-16px] mb-[-16px]" />}
            {isExpanded ? (
                <div className="flex flex-col gap-[16px] mt-[-16px]">
                    <div className="w-full">
                        <Label htmlFor="alias" className="text-[16px] mb-[8px]">
                            Title<span className="text-red-500 text-[16px] m-[-5px]">*</span>
                        </Label>
                        <Input
                            id="alias"
                            name="alias"
                            type="text"
                            value={location.alias}
                            required
                            className="px-[28px] py-[16px] h-[45px] rounded-[10px] placeholder:text-gray-400 placeholder:text-[16px] bg-transparent text-[16px]"
                            onChange={(e) => setLocation({ ...location, alias: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-[8px] w-full">
                        <Label htmlFor="streetAddress" className="text-[16px]">
                            Street Address<span className="text-red-500 text-[16px] m-[-5px]">*</span>
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
                                City<span className="text-red-500 text-[16px] m-[-5px]">*</span>
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
                                State<span className="text-red-500 text-[16px] m-[-5px]">*</span>
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
                                Country<span className="text-red-500 text-[16px] m-[-5px]">*</span>
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
                                Postal Code<span className="text-red-500 text-[16px] m-[-5px]">*</span>
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
                    {error || saveError ? (
                        <p className="text-red-400 text-[14px] self-center">{error || saveError}</p>
                    ) : (
                        ""
                    )}
                    <Button
                        className="text-[14px] py-[7px] bg-[var(--pink)] text-[var(--fuchsia)] hover:bg-fuchsia hover:text-white self-end w-fit h-fit flex justify-center items-center gap-[8px]"
                        onClick={handleCollapse}
                        style={{ paddingInline: "25px" }}
                    >
                        Save and close <IoCheckmark className="text-[24px] mb-[2px] group hover:text-white" />
                    </Button>
                </div>
            ) : (
                <div className="mb-[16px]">
                    <p>{location.streetAddress}</p>
                    <p>
                        {location.city}
                        {location.city !== "" && location.stateProvince !== "" && ","} {location.stateProvince}{" "}
                        {location.postalCode}
                    </p>
                    <p>{location.country}</p>
                </div>
            )}
        </Card>
    );
}
