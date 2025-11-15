"use client";

import { cn } from "@/lib/utils";
import { SaveStatus } from "@/types/claim";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface SaveStatusIndicatorProps {
    status: SaveStatus;
    className?: string;
}

export function SaveStatusIndicator({ status, className }: SaveStatusIndicatorProps) {
    if (status === "idle") {
        return null;
    }

    return (
        <div className={cn("flex items-center gap-2 text-sm", className)}>
            {status === "saving" && (
                <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-gray-600">Saving...</span>
                </>
            )}
            {status === "saved" && (
                <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">All changes saved</span>
                </>
            )}
            {status === "error" && (
                <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">Error saving changes</span>
                </>
            )}
        </div>
    );
}
