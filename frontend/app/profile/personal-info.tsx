"use client";

import { getUser, updateUserInfo } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, SquarePenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ProfileSettingsCard } from "./common";
import { HiOutlineX } from "react-icons/hi";
import { useServerActionQuery } from "@/api/requestHandlers";

export function PersonalInfoSettings() {
    const queryClient = useQueryClient();

    const [mode, setMode] = useState<"view" | "edit">("view");

    const [editedInfo, setEditedInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
    });

    const { data: userInfoData } = useServerActionQuery({
        queryKey: ["userInfo"],
        queryFn: getUser,
    });

    useEffect(() => {
        if (userInfoData) {
            setEditedInfo({
                firstName: userInfoData.firstName,
                lastName: userInfoData.lastName,
                email: userInfoData.email ?? "",
                phoneNumber: userInfoData.phoneNumber ?? "",
            });
        }
    }, [userInfoData]);

    const { mutate: updateInfoMutation } = useMutation({
        mutationFn: updateUserInfo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userInfo"] });
            setMode("view");
        },
    });

    function onSaveInfo() {
        updateInfoMutation({
            firstName: editedInfo.firstName,
            lastName: editedInfo.lastName,
            email: editedInfo.email,
            id: userInfoData?.id ?? "",
            phoneNumber: editedInfo.phoneNumber,
        });
    }

    function onDiscardChanges() {
        resetEditedInfo();
        setMode("view");
    }

    function resetEditedInfo() {
        setEditedInfo({
            firstName: userInfoData?.firstName ?? "",
            lastName: userInfoData?.lastName ?? "",
            email: userInfoData?.email ?? "",
            phoneNumber: userInfoData?.phoneNumber ?? "",
        });
    }

    return (
        <ProfileSettingsCard
            title="Personal Information"
            subtitle="View and update your personal details and account information"
            action={
                <div className="flex gap-2">
                    <Button
                        size="icon"
                        className={cn(
                            "group bg-slate cursor-pointer",
                            mode === "edit"
                                ? "bg-fuchsia hover:bg-pink hover:text-fuchsia"
                                : "bg-slate hover:bg-fuchsia hover:text-white"
                        )}
                        onClick={() =>
                            setMode((prev) => {
                                if (prev === "view") {
                                    resetEditedInfo();
                                    return "edit";
                                }

                                return "view";
                            })
                        }
                    >
                        <SquarePenIcon
                            className={cn(
                                mode === "edit"
                                    ? "text-white group-hover:text-fuchsia"
                                    : "text-black group-hover:text-white"
                            )}
                        />
                    </Button>
                    {mode == "edit" && (
                        <Button
                            size="icon"
                            variant="secondary"
                            className="group hover:bg-fuchsia hover:text-white"
                            onClick={onDiscardChanges}
                        >
                            <HiOutlineX className={"text-black group-hover:text-white"} />
                        </Button>
                    )}
                </div>
            }
        >
            {mode === "view" ? (
                <div className="flex gap-10">
                    <InfoBlock title="First Name">{userInfoData?.firstName}</InfoBlock>
                    <InfoBlock title="Last Name">{userInfoData?.lastName}</InfoBlock>
                    <InfoBlock title="Phone Number">{userInfoData?.phoneNumber}</InfoBlock>
                    <InfoBlock title="Email">{userInfoData?.email}</InfoBlock>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="grid grid-cols-2 grid-rows-2 gap-x-10 gap-y-2.5 row-">
                        <InfoEditBlock
                            title="First Name"
                            prefill={editedInfo.firstName}
                            onChange={(value) => setEditedInfo({ ...editedInfo, firstName: value })}
                        />
                        <InfoEditBlock
                            title="Last Name"
                            prefill={editedInfo.lastName}
                            onChange={(value) => setEditedInfo({ ...editedInfo, lastName: value })}
                        />
                        <InfoEditBlock
                            title="Phone Number"
                            prefill={editedInfo.phoneNumber}
                            onChange={(value) => setEditedInfo({ ...editedInfo, phoneNumber: value })}
                        />
                        <InfoEditBlock
                            title="Email"
                            prefill={editedInfo.email}
                            onChange={(value) => setEditedInfo({ ...editedInfo, email: value })}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            className="bg-light-fuchsia hover:bg-fuchsia hover:text-white text-fuchsia w-40 cursor-pointer"
                            size="sm"
                            onClick={onSaveInfo}
                        >
                            Save and close <CheckIcon size={24} />
                        </Button>
                    </div>
                </div>
            )}
        </ProfileSettingsCard>
    );
}

function InfoEditBlock({
    title,
    prefill,
    onChange,
}: {
    title: string;
    prefill: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            {title}
            <Input className="h-10 rounded-xl" defaultValue={prefill} onChange={(e) => onChange(e.target.value)} />
        </div>
    );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <h4 className="font-bold">{title}</h4>
            {children}
        </div>
    );
}
