"use client";

import { createClaimPDF } from "@/api/claim";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useServerActionMutation } from "@/api/requestHandlers";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
type ExportStepProps = {
    claimId: string | null;
    handleStepForward: () => void;
};

export default function ExportStep({ claimId, handleStepForward }: ExportStepProps) {
    const queryClient = useQueryClient();
    const [exported, setExported] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoadingPDFDownload, setIsLoadingPDFDownload] = useState<boolean>(false);
    const router = useRouter();

    const { mutate: updateBusinessMutate } = useServerActionMutation({
        mutationFn: async () => {
            setIsLoadingPDFDownload(true);
            return createClaimPDF(claimId!);
        },
        onError: (error: Error) => {
            setIsLoadingPDFDownload(false);
            setError(String(error));
        },
        onSuccess: (data) => {
            window.open(data.url, "_blank");
            queryClient.invalidateQueries({ queryKey: ["banner-data"] });
            queryClient.invalidateQueries({ queryKey: ["claim-in-progress"] });
            setIsLoadingPDFDownload(false);
            setExported(true);
            handleStepForward();
        },
    });

    return (
        <Card className="border-none shadow-none">
            {exported ? (
                <div className="flex flex-col p-[25px] items-center justify-center gap-[56]">
                    <p className="font-bold text-[30px]">Success!</p>
                    <Button
                        className="w-[195px] h-[34px] bg-fuchsia hover:bg-pink hover:text-fuchsia text-white"
                        onClick={() => router.push("/")}
                    >
                        Return to Dashboard
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col p-[25px] items-center justify-center gap-[56]">
                    <div className="flex flex-col gap-5 items-center justify-center">
                        <h3 className="font-bold text-[30px]">Export Your Claim Report</h3>
                        <p>Select a method to export your completed claim report PDF.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex flex-col items-center gap-3">
                            <Button
                                className="group w-[195px] h-[34px] bg-fuchsia hover:bg-pink hover:text-fuchsia text-white"
                                onClick={() => updateBusinessMutate()}
                            >
                                Download PDF
                                {isLoadingPDFDownload && <Spinner className="group-hover:text-fuchsia" fontSize={20} />}
                            </Button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm px-1"> {error}</p>}
                </div>
            )}
        </Card>
    );
}
