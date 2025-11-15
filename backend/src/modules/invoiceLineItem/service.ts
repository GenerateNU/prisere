import { IInvoiceLineItemTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import { validate } from "uuid";
import Boom from "@hapi/boom";
import { InvoiceLineItem } from "../../entities/InvoiceLineItem";
import { CreateOrUpdateInvoiceLineItemsDTO } from "../../types/InvoiceLineItem";
import { IInvoiceTransaction } from "../invoice/transaction";

export interface IInvoiceLineItemService {
    bulkCreateOrUpdateInvoiceLineItems(payload: CreateOrUpdateInvoiceLineItemsDTO): Promise<InvoiceLineItem[]>;
    getInvoiceLineItemById(id: string): Promise<InvoiceLineItem>;
    getInvoiceLineItemsForInvoice(invoiceId: string): Promise<InvoiceLineItem[]>;
}

export class InvoiceLineItemService implements IInvoiceLineItemService {
    private invoiceLineItemTransaction: IInvoiceLineItemTransaction;
    private invoiceTransaction: IInvoiceTransaction;

    constructor(invoiceLineItemTransaction: IInvoiceLineItemTransaction, invoiceTransaction: IInvoiceTransaction) {
        this.invoiceLineItemTransaction = invoiceLineItemTransaction;
        this.invoiceTransaction = invoiceTransaction;
    }

    bulkCreateOrUpdateInvoiceLineItems = withServiceErrorHandling(
        async (payload: CreateOrUpdateInvoiceLineItemsDTO): Promise<InvoiceLineItem[]> => {
            const uniqueInvoiceIds = [...new Set(payload.items.map((inv) => inv.invoiceId))];

            // validate all uuids as being properly formatted
            const badIds = uniqueInvoiceIds.filter((id) => !validate(id));

            if (badIds.length) {
                throw Boom.badRequest(`Invalid uuid format: ${badIds.join(", ")}`);
            }

            // make sure all those invoices actually exist in the DB to get a decent error message
            const missingIds = await this.invoiceTransaction.validateInvoicesExist(uniqueInvoiceIds);

            if (missingIds.length !== 0) {
                throw Boom.badRequest(`Invoices not found: ${missingIds.join(", ")}`);
            }

            const newInvoices = await this.invoiceLineItemTransaction.createOrUpdateInvoiceLineItems(payload);

            if (!newInvoices || newInvoices.length === 0) {
                throw Boom.internal("Failed to create invoice line items");
            }

            return newInvoices;
        }
    );

    getInvoiceLineItemById = withServiceErrorHandling(async (id: string): Promise<InvoiceLineItem> => {
        const invoiceLineItem = await this.invoiceLineItemTransaction.getInvoiceLineItemById(id);

        if (!invoiceLineItem) {
            throw Boom.notFound("Invoice line item not found");
        }

        return invoiceLineItem;
    });

    getInvoiceLineItemsForInvoice = withServiceErrorHandling(async (id: string): Promise<InvoiceLineItem[]> => {
        const invoiceLineItems = await this.invoiceLineItemTransaction.getInvoiceLineItemsForInvoice(id);

        return invoiceLineItems;
    });
}
