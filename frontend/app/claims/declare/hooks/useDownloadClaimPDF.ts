import { fetchPDFForClaim } from "@/api/claim";
import { useState } from "react";

export const useDownloadClaimPDF = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const download = async (claimId: string) => {
        setIsLoading(true);
        try {
            const url = await fetchPDFForClaim(claimId);
            downloadFileSimple(url.url);
        } catch (err) {
            setIsLoading(false);
            throw err;
        }
        setIsLoading(false);
    };

    return {
        isLoading,
        download,
    };
};

function downloadFileSimple(presignedUrl: string): void {
    const link = document.createElement("a");
    link.href = presignedUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
