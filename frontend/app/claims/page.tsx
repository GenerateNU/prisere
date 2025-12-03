"use client";

import { getClaimInProgress } from "@/api/company";
import { ClaimInProgress } from "@/components/claims/ClaimInProgress";
import { Button } from "@/components/ui/button";
import { ClaimInProgressIndexMapping } from "@/types/claim";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Claims() {
    const router = useRouter();

    const { data: claimInProgress } = useQuery({
        queryKey: ["claim-in-progress"],
        queryFn: getClaimInProgress,
    });

    return (
        <div className="flex flex-col gap-[32px] px-[70px] pt-[72px] mb-4 bg-slate h-screen">
            <h2 className="text-[40px] font-bold">Claim Reports</h2>
            {claimInProgress && claimInProgress.status !== "FILED" ? (
                <ClaimInProgress
                    step={ClaimInProgressIndexMapping[claimInProgress.status]}
                    claimId={claimInProgress.id}
                />
            ) : null}
            <Button
                variant="outline"
                className="mt-4 w-[200px] h-[38px]"
                onClick={() => router.push("/claims/declare")}
            >
                Declare a Disaster
            </Button>
        </div>
    );
}
