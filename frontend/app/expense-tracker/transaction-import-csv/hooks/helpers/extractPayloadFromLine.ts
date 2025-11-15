import { CreatePurchaseLineItemsRequest } from "@/types/purchase-line-items";

export const extractTransactionLineItemFromLine = (line: string[], columnOrdering: string[]) => {
    let result: Partial<CreatePurchaseLineItemsRequest["items"][number]> = { type: "typical" };

    for (let columnIdx = 0; columnIdx < columnOrdering.length; columnIdx++) {
        const currColumn = columnOrdering[columnIdx];
        const currElement = line[columnIdx];

        switch (currColumn) {
            case "amountcents":
                result = { ...result, amountCents: parseInt(currElement) * 100 };
                break;
            case "description":
                result = { ...result, description: currElement };
                break;
            case "category":
                result = { ...result, category: currElement };
                break;
            default:
                //This should not be possible as we handle the column name state interally
                throw new Error("The current column is not a valid column name");
        }
    }
    return result;
};
