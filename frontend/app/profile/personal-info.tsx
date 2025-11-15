"use client";

import { getUser, updateUserInfo } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { ProfileSettingsCard } from "./common";

export function PersonalInfoSettings() {
    const queryClient = useQueryClient();

    const [mode, setMode] = useState<"view" | "edit">("view");

    const [editedInfo, setEditedInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
    });

    const { data: userInfoData } = useQuery({
        queryKey: ["userInfo"],
        queryFn: getUser,
    });

    useEffect(() => {
        if (userInfoData) {
            setEditedInfo({
                firstName: userInfoData.firstName,
                lastName: userInfoData.lastName,
                email: userInfoData.email ?? "",
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
        });
    }

    return (
        <ProfileSettingsCard
            title="Personal Information"
            subtitle="View and update your personal details and account information"
            action={
                <div className="flex gap-2">
                    <button
                        className={cn(
                            "bg-slate rounded-full p-2 cursor-pointer ",
                            mode === "edit" ? "bg-fuchsia hover:bg-fuchsia/80" : "bg-slate hover:bg-slate/80"
                        )}
                        onClick={() => setMode((prev) => (prev === "view" ? "edit" : "view"))}
                    >
                        <SquarePenIcon className={cn(mode === "edit" ? "text-white" : "text-black")} />
                    </button>
                    <button className="bg-slate rounded-full p-2 cursor-pointer hover:bg-slate/80">
                        <Trash2Icon />
                    </button>
                </div>
            }
        >
            <div className="h-px w-ful bg-[#DBDBDB] mb-3" />
            {mode === "view" ? (
                <div className="flex gap-10">
                    <InfoBlock title="First Name">{userInfoData?.firstName}</InfoBlock>
                    <InfoBlock title="Last Name">{userInfoData?.lastName}</InfoBlock>
                    <InfoBlock title="Email">{userInfoData?.email}</InfoBlock>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="grid grid-cols-2 grid-rows-2 gap-x-10 gap-y-2.5 row-">
                        <InfoEditBlock
                            title="First Name"
                            prefill={userInfoData?.firstName ?? ""}
                            onChange={(value) => setEditedInfo({ ...editedInfo, firstName: value })}
                        />
                        <InfoEditBlock
                            title="Last Name"
                            prefill={userInfoData?.lastName ?? ""}
                            onChange={(value) => setEditedInfo({ ...editedInfo, lastName: value })}
                        />
                        <InfoEditBlock
                            title="Email"
                            prefill={userInfoData?.email ?? ""}
                            onChange={(value) => setEditedInfo({ ...editedInfo, email: value })}
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button
                            className="bg-light-fuchsia hover:bg-light-fuchsia/80 text-fuchsia w-40 cursor-pointer"
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
