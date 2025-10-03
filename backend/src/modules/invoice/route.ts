import { DataSource } from "typeorm";
import { Hono } from "hono";
import { InvoiceTransaction, IInvoiceTransaction } from "./transaction";
import { InvoiceService, IInvoiceService } from "./service";
import { InvoiceController, IInvoiceController } from "./controller";

export const invoiceRoutes = (db: DataSource): Hono => {
    const invoice = new Hono();

    const invoiceTransaction: IInvoiceTransaction = new InvoiceTransaction(db);
    const invoiceService: IInvoiceService = new InvoiceService(
        invoiceTransaction
    );
    const invoiceController: IInvoiceController = new InvoiceController(
        invoiceService
    );

    invoice.get("/:id", (ctx) => invoiceController.getInvoice(ctx));
    invoice.get("/", (ctx) => invoiceController.getInvoicesForCompany(ctx));
    invoice.post("/bulk", (ctx) => invoiceController.bulkCreateOrUpdateInvoice(ctx));

    return invoice;
};