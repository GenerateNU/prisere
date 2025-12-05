"use client";
import { Button } from "@/components/ui/button";
import { QuickBooksIcon } from "@/icons/quickbooks";
import { CirclePlusIcon } from "lucide-react";
import { ProfileSettingsCard } from "./common";
import { redirectToQuickbooks } from "@/api/quickbooks";

export function LinkedAccountsSettings() {
    const quickbooksAuth = async () => {
        const url = await redirectToQuickbooks();
        if (url) {
            window.location.href = url;
        } else {
            console.error("Failed to retrieve QuickBooks URL");
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
                    className="bg-light-fuchsia hover:bg-light-fuchsia/80 text-fuchsia w-40 cursor-pointer"
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
                className="w-48 text-black mt-3"
                variant="secondary"
                // TODO: set up CSV import
            >
                <CirclePlusIcon /> Or import CSV files
            </Button>
        </ProfileSettingsCard>
    );
}
