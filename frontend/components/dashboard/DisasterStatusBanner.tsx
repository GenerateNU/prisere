'use client';
import {
    Banner,
    BannerAction,
    BannerClose,
    BannerIcon,
    BannerTitle,
} from '@/components/ui/shadcn-io/banner';
import { BannerData } from '@/types/user';
import { CircleAlert, CircleCheck } from 'lucide-react';
import Link from 'next/link';

type Props = {
    bannerData: BannerData | null;
};

export default function DisasterStatusBanner({ bannerData }: Props) {
    if (!bannerData) {
        return null;
    }

    // No disaster affecting business
    if (bannerData.status === "no-disaster") {
        return (
            <Banner className="w-full p-6 rounded-lg bg-white border-0">
                <div className="flex flex-row items-center w-full gap-3">
                    <BannerTitle className="text-lg font-semibold text-left flex-1 text-black">
                        There are currently no disasters affecting your business.
                    </BannerTitle>
                    <Link href="/claims">
                        <BannerAction className="max-w-xs rounded-lg hover:bg-pink bg-fuchsia text-white">
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
                            <img
                                src="/FEMA.png"
                                alt="FEMA"
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <BannerTitle className="text-2xl font-bold text-charcoal">
                            FEMA Disaster
                        </BannerTitle>
                    </div>
                        
                        <p className="text-base mb-1 text-charcoal">A FEMA disaster has been declared in your area.</p>
                        <p className="text-base text-charcoal">
                            Please register as soon as possible to avoid missing a deadline!
                        </p>
                    </div>
                    <Link href="https://www.disasterassistance.gov/" target="_blank" rel="noopener noreferrer" className="self-end">
                        <BannerAction className="px-6 py-3 rounded-full hover:bg-pink bg-fuchsia text-white whitespace-nowrap ">
                            Register on FEMA's website
                        </BannerAction>
                    </Link>
                </div>
            </Banner>
        );
    }

    // Claim in progress
    if (bannerData.status === "has-claim") {
        return (
            <Banner className="w-full p-6 rounded-lg bg-white border-0">
                <div className="flex flex-row items-center w-full gap-3">
                    <div className="flex-1">
                        <BannerTitle className="text-lg font-semibold text-left flex-1 text-black mb-2">
                            You have a report in progress.
                        </BannerTitle>
                        <p className="text-sm text-charcoal mb-4">
                            Continue filing your claim report to ensure you maximize benefits.
                        </p>
                        {/* Progress indicator */}
                        <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step <= 3
                                                ? 'bg-burgundy-700 text-pink bg-fuchsia' // completed steps
                                                : step === 4
                                                    ? 'bg-pink text-fuchsia' // current step
                                                    : 'bg-white text-fuchsia border-fuchsia border-2' // upcoming steps
                                            }`}
                                    >
                                        {step <= 3 ? '🗸' : step}
                                    </div>
                                    {step < 5 && (
                                        <div
                                            className={`w-12 h-1 ${step < 3 ? 'bg-fuchsia' : 'bg-fuchsia opacity-50'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <Link href={"/expense-tracker"} className="text-sm font-semibold underline no-underline">
                        <BannerAction className="max-w-xs rounded-lg hover:bg-pink bg-fuchsia text-white">
                            Continue filing claim report
                        </BannerAction>
                    </Link>
                    
                </div>
            </Banner>
        );
    }

    return null;
}