import { Banner, BannerAction, BannerTitle } from "@/components/ui/shadcn-io/banner";
import { ClaimStepNumber } from "@/types/claim";
import Link from "next/link";
import Progress from "../progress";

export function ClaimInProgress({ step, claimId }: { step: ClaimStepNumber; claimId: string }) {
    return (
        <Banner className="w-full px-6 py-7 rounded-lg bg-white border-0">
            <div className="flex flex-col w-full justify-between gap-2">
                <div>
                    <BannerTitle className="text-2xl text-charcoal font-semibold text-left flex-1 mb-2">
                        You have a report in progress.
                    </BannerTitle>
                    <p className="text-xl text-charcoal mb-4">
                        Continue filing your claim report to ensure you maximize benefits.
                    </p>
                </div>
                <div className="flex flex-row items-center">
                    <Progress
                        className="justify-start mb-0"
                        progress={step}
                        items={[{ step: 1 }, { step: 2 }, { step: 3 }, { step: 4 }, { step: 5 }]}
                    />
                    <Link
                        href={`/claims/declare?step=${step - 1}&claimId=${claimId}`}
                        className="text-sm font-semibold"
                    >
                        <BannerAction className="max-w-xs rounded-full hover:bg-pink bg-fuchsia text-white font-medium">
                            Continue filing claim report
                        </BannerAction>
                    </Link>
                </div>
            </div>
        </Banner>
    );
}
