import { createClaimPDF } from "@/api/claim";
import { useState } from "react";
import { isServerActionSuccess } from "@/api/types";

export const useDownloadClaimPDF = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const download = async (claimId: string) => {
        setIsLoading(true);
        try {
            const result = await createClaimPDF(claimId);
            if (isServerActionSuccess(result)) {
                downloadFileSimple(result.data.url);
            } else {
                throw new Error(result.error);
            }
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
