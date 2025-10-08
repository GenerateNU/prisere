import { DataSource } from "typeorm";
import { Hono } from "hono";
import { InvoiceTransaction, IInvoiceTransaction } from "./transaction";
import { InvoiceService, IInvoiceService } from "./service";
import { InvoiceController, IInvoiceController } from "./controller";
import { CompanyTransaction, ICompanyTransaction } from "../company/transaction";

export const invoiceRoutes = (db: DataSource): Hono => {
    const invoice = new Hono();

    const companyTransaction: ICompanyTransaction = new CompanyTransaction(db);
    const invoiceTransaction: IInvoiceTransaction = new InvoiceTransaction(db);
    const invoiceService: IInvoiceService = new InvoiceService(invoiceTransaction, companyTransaction);
    const invoiceController: IInvoiceController = new InvoiceController(invoiceService);

    invoice.get("/:id", (ctx) => invoiceController.getInvoice(ctx));
    invoice.get("/", (ctx) => invoiceController.getInvoicesForCompany(ctx));
    invoice.post("/bulk", (ctx) => invoiceController.bulkCreateOrUpdateInvoice(ctx));
    invoice.get("/bulk/:id/totalIncome", (ctx) => invoiceController.sumInvoicesByCompanyAndDateRange(ctx));

    return invoice;
};
