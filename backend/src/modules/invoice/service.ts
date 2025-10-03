import { IInvoiceTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import { CreateOrUpdateInvoicesDTO, GetCompanyInvoicesDTO } from "../../types/Invoice";
import { Invoice } from "../../entities/Invoice";
import Boom from "@hapi/boom";

export interface IInvoiceService {
    bulkCreateOrUpdateInvoice(payload: CreateOrUpdateInvoicesDTO): Promise<Invoice[]>;
    getInvoiceById(id: string): Promise<Invoice>;
    getInvoicesForCompany(
        payload: GetCompanyInvoicesDTO
    ): Promise<Invoice[]>;
}

export class InvoiceService implements IInvoiceService {
    private invoiceTransaction: IInvoiceTransaction;

    constructor(qbTransaction: IInvoiceTransaction) {
        this.invoiceTransaction = qbTransaction;
    }

    bulkCreateOrUpdateInvoice = withServiceErrorHandling(
        async (payload: CreateOrUpdateInvoicesDTO): Promise<Invoice[]> => {
            const newInvoices = await this.invoiceTransaction.createOrUpdateInvoices(payload);

            if (!newInvoices || newInvoices.length === 0) {
                throw Boom.internal("Failed to create invoices");
            }

            return newInvoices;
        }
    );

    getInvoiceById = withServiceErrorHandling(async (id: string): Promise<Invoice> => {
        const invoice = await this.invoiceTransaction.getInvoiceById(id);

        if (!invoice) {
            throw Boom.notFound("Invoice not found")
        }

        return invoice;
    });

    getInvoicesForCompany = withServiceErrorHandling(
        async (payload: GetCompanyInvoicesDTO): Promise<Invoice[]> => {
            const invoices = await this.invoiceTransaction.getInvoicesForCompany(payload);

            return invoices;
        }
    );
}