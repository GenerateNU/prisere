"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";
import Link from "next/link";

type Props = {
    title?: string;
    message?: string;
    showButtons?: boolean;
};

export default function NoDataOverlay({
    title = "Looks like you have no data",
    message = "Upload a file for any cash basis which you're trying to convert to accrual to unlock this dashboard.",
    showButtons = true,
}: Props) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
            <Card className="w-full max-w-md mx-4 border-none shadow-xl">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                    {/* Alert Icon */}
                    <div className="w-16 h-16 rounded-full bg-pink flex items-center justify-center">
                        <CircleAlert className="w-8 h-8 text-fuchsia" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-charcoal">{title}</h3>

                    {/* Message */}
                    <p className="text-sm text-charcoal/80">{message}</p>

                    {/* Action Buttons */}
                    {showButtons && (
                        <div className="flex gap-3 pt-2">
                            <Link href="/quickbooks">
                                <Button className="rounded-full bg-fuchsia hover:bg-pink text-white px-6 w-42 h-16">
                                    Sync Quickbooks
                                </Button>
                            </Link>
                            <Link href="/upload-csv">
                                <Button
                                    variant="outline"
                                    className="rounded-full border-charcoal text-charcoal px-6 w-42 h-16"
                                >
                                    Upload CSV
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
