import { DataSource } from "typeorm";
import { Hono } from "hono";
import { IInvoiceLineItemTransaction, InvoiceLineItemTransaction } from "./transaction";
import { IInvoiceLineItemService, InvoiceLineItemService } from "./service";
import { IInvoiceLineItemController, InvoiceLineItemController } from "./controller";
import { IInvoiceTransaction, InvoiceTransaction } from "../invoice/transaction";

export const invoiceLineItemsRoutes = (db: DataSource): Hono => {
    const invoiceLineItem = new Hono();

    const invoiceTransaction: IInvoiceTransaction = new InvoiceTransaction(db);
    const invoiceLineItemTransaction: IInvoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
    const invoiceLineItemService: IInvoiceLineItemService = new InvoiceLineItemService(invoiceLineItemTransaction, invoiceTransaction);
    const invoiceLineItemController: IInvoiceLineItemController = new InvoiceLineItemController(invoiceLineItemService);

    invoiceLineItem.get("/:id", (ctx) => invoiceLineItemController.getInvoiceLineItemById(ctx));
    invoiceLineItem.post("/bulk", (ctx) => invoiceLineItemController.bulkCreateOrUpdateInvoiceLineItems(ctx));
    // GET /quickbooks/invoice/{id}/lines is in the Invoice routes file

    return invoiceLineItem;
};
