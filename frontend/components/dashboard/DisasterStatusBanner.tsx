"use client";
import { Banner, BannerAction, BannerTitle } from "@/components/ui/shadcn-io/banner";
import { ClaimInProgressIndexMapping } from "@/types/claim";
import { BannerData } from "@/types/user";
import Link from "next/link";
import { ClaimInProgress } from "../claims/ClaimInProgress";

type DisasterStatusBannerProps = {
    bannerData: BannerData;
};

export default function DisasterStatusBanner({ bannerData }: DisasterStatusBannerProps) {
    // No disaster affecting business
    if (bannerData.status === "no-disaster") {
        return (
            <Banner className="w-full p-6 rounded-lg bg-white border-0">
                <div className="flex flex-row items-center w-full gap-3">
                    <BannerTitle className="text-lg font-semibold text-left flex-1 text-black">
                        There are currently no disasters affecting your business.
                    </BannerTitle>
                    <Link href="/claims">
                        <BannerAction className="max-w-xs rounded-full hover:bg-pink bg-fuchsia text-white text-sm font-medium">
                            File a claim report
                        </BannerAction>
                    </Link>
                </div>
            </Banner>
        );
    }

    // FEMA disaster declared (no claim filed yet)
    if (bannerData.status === "no-claim") {
        return (
            <Banner className="w-full p-6 rounded-lg bg-white border-0">
                <div className="flex flex-row items-start w-full gap-4">
                    <div className="flex-1">
                        <div className="justify-start inline-block px-3 py-1 mb-3 text-xs font-semibold text-fuchsia bg-pink rounded">
                            IMPORTANT
                        </div>
                        <div className="flex flex-row items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-300">
                                <img src="/FEMA.png" alt="FEMA" className="object-cover w-full h-full" />
                            </div>
                            <BannerTitle className="text-2xl font-bold text-charcoal">FEMA Disaster</BannerTitle>
                        </div>

                        <p className="text-base mb-1 text-charcoal">A FEMA disaster has been declared in your area.</p>
                        <p className="text-base text-charcoal">
                            Please register as soon as possible to avoid missing a deadline!
                        </p>
                    </div>
                    <Link
                        href="https://www.disasterassistance.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-end"
                    >
                        <BannerAction className="px-6 py-3 rounded-full hover:bg-pink bg-fuchsia text-white hover:text-fuchsia whitespace-nowrap text-sm font-medium">
                            Register on FEMA&apos;s website
                            {/* Escaped quote character */}
                        </BannerAction>
                    </Link>
                </div>
            </Banner>
        );
    }

    // Claim in progress
    if (bannerData.status === "has-claim" && bannerData.claim) {
        const status = bannerData.claim.status;
        const progressStep = ClaimInProgressIndexMapping[status as keyof typeof ClaimInProgressIndexMapping] ?? 5;
        return <ClaimInProgress step={progressStep} claimId={bannerData.claim.id} />;
    }

    return null;
}
