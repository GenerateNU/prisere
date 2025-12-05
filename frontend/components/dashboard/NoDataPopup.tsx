"use client";

import { redirectToQuickbooks } from "@/api/quickbooks";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FiUpload } from "react-icons/fi";
import { GoSync } from "react-icons/go";

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
            <div className="bg-white rounded-[20px] px-[75px] py-[50px] max-w-md w-full mx-4 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-[24px] font-bold mb-4">Looks like you have no data</h2>
                    <p className="text-[16px] text-gray-600 mb-6 text-center">
                        Upload a CSV file or sync a QuickBooks account to use the expense tracker.
                    </p>

                    <div className="flex gap-3">
                        <Link href="/quickbooks">
                            <Button
                                className="group h-[34px] w-fit text-white text-[14px] bg-[var(--fuchsia)] hover:bg-pink hover:text-fuchsia"
                                onClick={async () => {
                                    await quickbooksAuth();
                                }}
                            >
                                <GoSync className="text-white group-hover:text-fuchsia" style={{ width: "14px" }} /> Sync Quickbooks
                            </Button>
                        </Link>
                        <Link href="/upload-csv">
                            <Button className="group h-[34px] w-fit text-white text-[14px] bg-[var(--fuchsia)] hover:bg-pink hover:text-fuchsia">
                                <FiUpload className="text-white group-hover:text-fuchsia" style={{ width: "14px" }} /> Upload CSV
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
