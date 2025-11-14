"use client";

import { useState, useEffect } from "react";
import NoDataPopup from "./NoDataPopup";

type Props = {
    hasData: boolean;
};

export default function NoDataPopupWrapper({ hasData }: Props) {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        // Only show popup on initial mount if there's no data
        if (!hasData) {
            setShowPopup(true);
        }
    }, [hasData]);

    return <NoDataPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />;
}
