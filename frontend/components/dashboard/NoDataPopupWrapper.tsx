"use client";

import { useState, useEffect } from "react";
import NoDataPopup from "./NoDataPopup";

type Props = {
    hasData: boolean;
};

export default function NoDataPopupWrapper({ hasData }: Props) {
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (!hasData) {
            setShowPopup(true);
        }
    }, [hasData]);

    return <NoDataPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />;
}
