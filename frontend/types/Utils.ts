import { z } from "zod";
import { DisasterType, PurchaseWithLineItems } from "@/types/purchase";

export const ErrorResponseSchema = z.object({
    error: z.string(),
});

export type paginationParams = {
    page: number;
    limit: number;
};

/**
 * PROPS FOR FRONTEND COMPONENTS
 */
export interface DisasterLabelProps {
    disasterType: DisasterType;
    updateDisasterType: (type: DisasterType, lineItems: string[]) => void;
    lineItemIds: string[];
    editableTags: boolean;
}

export interface SideViewProps {
    purchase: PurchaseWithLineItems | null;
    open: boolean;
    onOpenChange: () => void;
}
