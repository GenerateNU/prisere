"use client";

import { createClaimPDF } from "@/api/claim";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React from "react";

export default function ExportStep({ claimId }: { claimId: string | null }) {
    const [exported, setExported] = React.useState(false);
    const router = useRouter();

    const handleDownloadPDF = async () => {
        if (!claimId) {
            return;
        }

        const { url } = await createClaimPDF(claimId);

        window.open(url, "_blank");
        setExported(true);
    };

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
                    <div className="flex flex-col items-center gap-3">
                        <Button
                            className="w-[195px] h-[34px] bg-fuchsia hover:bg-fuchsia/80 text-white"
                            onClick={handleDownloadPDF}
                        >
                            Download PDF
                        </Button>
                        <Button
                            className="w-[195px] h-[34px] bg-light-fuchsia hover:bg-light-fuchsia/80 text-fuchsia"
                            onClick={() => setExported(true)}
                        >
                            Email a Copy
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
