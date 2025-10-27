'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React from "react";

export default function ExportStep() {
    const [exported, setExported] = React.useState(false);
    const router = useRouter(); 

    return (
        <Card>
            {exported ?
                <div className="flex flex-col p-[25px] items-center justify-center gap-[56]">
                    <p className="font-bold text-[30px]">Success!</p>
                    <Button className="w-[195px] h-[45px]" onClick={() => router.push("/")}>Return to Dashboard</Button>
                </div>
                :
                <div className="flex flex-col p-[25px] items-center justify-center gap-[56]">
                    <div className="flex flex-col items-center justify-center">
                        <h3 className="font-bold text-[30px]">Export Your Claim Report</h3>
                        <p className="text-[18px]">Select a method to export your completed claim report PDF.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button className="w-[195px] h-[45px]">Download PDF</Button>
                        <Button className="w-[195px] h-[45px]">Email a Copy</Button>
                        <Button variant="link" className="w-[195px] h-[45px]" onClick={() => setExported(true)}>Continue</Button>
                    </div>
                </div>
            }
        </Card>
    );
}