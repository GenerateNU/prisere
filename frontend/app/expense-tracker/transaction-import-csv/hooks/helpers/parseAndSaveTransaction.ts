import { CreatePurchaseLineItemsRequest } from "@/types/purchase-line-items";
import { ErroredParsedRowResult, ParsedRowResult } from "../../types";
import { extractTransactionLineItemFromLine } from "./extractPayloadFromLine";
import { CreateInvoiceLineItemsRequest } from "@/types/invoice-line-items";
import { createBulkPurchaseLineItems } from "@/api/purchase-line-item";
import { createBulkInvoiceLineItems } from "@/api/invoice-line-item";

export const parseAndSaveTransaction = async (
    values: ParsedRowResult[],
    parentTransactionId: string,
    transactionType: "purchase" | "invoice",
    columnOrdering: string[]
): Promise<ErroredParsedRowResult[] | undefined> => {
    const importErrors: ErroredParsedRowResult[] = [];
    //Transform the current line to match the payload trpe
    const transformedPayload = values.map((value) => {
        if ("error" in value) {
            importErrors.push(value);
            return;
        }

        const fkRelation =
            transactionType === "invoice" ? { invoiceId: parentTransactionId } : { purchaseId: parentTransactionId };

        return {
            ...extractTransactionLineItemFromLine(value.rawRowValues, columnOrdering),
            ...fkRelation,
        };
    });

    if (importErrors.length > 0) {
        return importErrors;
    }

    if (transactionType === "purchase") {
        await createBulkPurchaseLineItems({ items: transformedPayload } as CreatePurchaseLineItemsRequest);
    } else if (transactionType === "invoice") {
        await createBulkInvoiceLineItems({ items: transformedPayload } as CreateInvoiceLineItemsRequest);
    }
};
