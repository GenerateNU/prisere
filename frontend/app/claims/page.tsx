"use client";

import { getClaimInProgress } from "@/api/company";
import { ClaimInProgress } from "@/components/claims/ClaimInProgress";
import { ClaimInProgressIndexMapping } from "@/types/claim";
import { useQuery } from "@tanstack/react-query";
import ClaimTable from "./claim-table/claim-table";

export default function Claims() {
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
            <ClaimTable claimInProgress={claimInProgress?.status !== "FILED"} />
        </div>
    );
}
