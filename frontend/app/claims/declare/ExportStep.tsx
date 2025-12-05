"use client";

import { createClaimPDF } from "@/api/claim";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

type ExportStepProps = {
    claimId: string | null;
    handleStepForward: () => void;
};

export default function ExportStep({ claimId, handleStepForward }: ExportStepProps) {
    const [exported, setExported] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoadingPDFDownload, setIsLoadingPDFDownload] = useState<boolean>(false);
    const router = useRouter();

    const { mutate: updateBusinessMutate } = useMutation({
        mutationFn: async () => {
            const result = await createClaimPDF(claimId!);
            setIsLoadingPDFDownload(true);
            return result.url;
        },
        onError: (error: Error) => {
            setIsLoadingPDFDownload(false);
            setError(error.message);
        },
        onSuccess: (url: string) => {
            window.open(url, "_blank");
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
                        className="w-[195px] h-[34px] bg-fuchsia hover:bg-fuchsia/80 text-white"
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
                                className="w-[195px] h-[34px] bg-fuchsia hover:bg-fuchsia/80 text-white"
                                onClick={() => updateBusinessMutate()}
                            >
                                Download PDF
                                {isLoadingPDFDownload && <Spinner />}
                            </Button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm px-1"> {error}</p>}
                </div>
            )}
        </Card>
    );
}
