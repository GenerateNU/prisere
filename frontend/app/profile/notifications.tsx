"use client";

import { getUserPreferences, updateUserPreferences } from "@/api/preferences";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BellDotIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ProfileSettingsCard } from "./common";

export function NotificationSettings() {
    const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(false);

    const { data: userPreferencesData } = useServerActionQuery({
        queryKey: ["userPreferences"],
        queryFn: getUserPreferences,
    });

    useEffect(() => {
        if (userPreferencesData) {
            setEmailNotifsEnabled(userPreferencesData.emailEnabled);
        }
    }, [userPreferencesData]);

    const queryClient = useQueryClient();

    const { mutate: updateUserPreferencesMutation } = useMutation({
        mutationFn: updateUserPreferences,
        onSuccess: (data) => {
            setEmailNotifsEnabled(data.emailEnabled);
            queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
        },
    });

    function onEmailNotifsChange(checked: boolean) {
        updateUserPreferencesMutation({
            emailEnabled: checked,
        });
    }

    return (
        <ProfileSettingsCard title="Notifications" subtitle="Stay informed with real-time alerts and important updates">
            <div className="flex justify-between border-[0.5px] border-[#DBDBDB] rounded-2xl p-4 items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-light-fuchsia p-2.5 rounded-full">
                        <BellDotIcon className="text-fuchsia" />
                    </div>
                    <div className="flex flex-col">
                        <span>Email Notifications</span>
                        <span className="text-sm">
                            Stay informed with updates about your business and disasters in your area
                        </span>
                    </div>
                </div>
                <Switch checked={emailNotifsEnabled} onCheckedChange={onEmailNotifsChange} className="w-16 h-8" />
            </div>
        </ProfileSettingsCard>
    );
}
