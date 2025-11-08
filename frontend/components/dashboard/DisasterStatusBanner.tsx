'use client';

import {
  Banner,
  BannerAction,
  BannerClose,
  BannerIcon,
  BannerTitle,
} from '@/components/ui/shadcn-io/banner';
import { CircleAlert } from 'lucide-react';

export default function DisasterStatusBanner() {
    const getBannerContent = () => {
        // If there are no active disasters in the area

        // If there is a disaster they have not created a report for 

        // They have a claim in progress for a disaster
        
    }

    return (
        <Banner>
            <BannerIcon icon={CircleAlert} />
            <BannerTitle>Important message</BannerTitle>
            <BannerAction>Learn more</BannerAction>
            <BannerClose />
        </Banner>
    )
}