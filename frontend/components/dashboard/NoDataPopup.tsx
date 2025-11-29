"use client";

import { redirectToQuickbooks } from "@/api/quickbooks";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

export default function NoDataPopup({ isOpen, onClose }: Props) {
    if (!isOpen) return <></>;

    const quickbooksAuth = async () => {
        const url = await redirectToQuickbooks();
        if (url) {
            window.open(url, "_blank");
        } else {
            console.error("Failed to retrieve QuickBooks URL");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <h2 className="text-xl font-bold mb-4">Looks like you have no data</h2>
                <p className="text-gray-600 mb-6">
                    Upload a CSV file or sync a QuickBooks account to use the expense tracker.
                </p>

                <div className="flex gap-3">
                    <Button
                        className="rounded-full bg-fuchsia hover:bg-pink text-white px-6 w-42 h-16"
                        onClick={async () => {
                            await quickbooksAuth();
                        }}
                    >
                        Sync Quickbooks
                    </Button>
                    <Link href="/upload-csv">
                        <Button variant="outline" className="rounded-full border-charcoal text-charcoal px-6 w-42 h-16">
                            Upload CSV
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
