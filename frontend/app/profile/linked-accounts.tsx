"use client";
import { Button } from "@/components/ui/button";
import { QuickBooksIcon } from "@/icons/quickbooks";
import { CirclePlusIcon } from "lucide-react";
import { ProfileSettingsCard } from "./common";
import { redirectToQuickbooks } from "@/api/quickbooks";
import { isServerActionSuccess } from "@/api/types";

export function LinkedAccountsSettings() {
    const quickbooksAuth = async () => {
        const result = await redirectToQuickbooks();
        if (isServerActionSuccess(result)) {
            window.location.href = result.data;
        } else {
            console.error(result.error);
        }
    };

    return (
        <ProfileSettingsCard
            title="Linked Accounts"
            subtitle="Connect your QuickBooks account to automatically import your business data"
        >
            <div className="flex justify-between border-[0.5px] border-[#DBDBDB] rounded-2xl p-4 items-center">
                <div className="flex items-center gap-2">
                    <QuickBooksIcon />
                    <span className="text-lg ">Sign in with QuickBooks</span>
                </div>
                <Button
                    className="bg-light-fuchsia hover:bg-fuchsia hover:text-white text-fuchsia w-40 cursor-pointer"
                    size="sm"
                    onClick={async () => {
                        await quickbooksAuth();
                    }}
                >
                    Connect account
                </Button>
            </div>

            <Button
                size={"sm"}
                className="w-48 text-black mt-3 hover:bg-fuchsia hover:text-white"
                variant="secondary"
                // TODO: set up CSV import
            >
                <CirclePlusIcon /> Or import CSV files
            </Button>
        </ProfileSettingsCard>
    );
}
