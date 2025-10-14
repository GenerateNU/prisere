import { IInvoiceTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    CreateOrUpdateInvoicesDTO,
    GetCompanyInvoicesByDateDTO,
    GetCompanyInvoicesDTO,
    GetCompanyInvoicesInMonthBinsResponse,
} from "../../types/Invoice";
import { Invoice } from "../../entities/Invoice";
import Boom from "@hapi/boom";
import { ICompanyTransaction } from "../company/transaction";
import { validate } from "uuid";

export interface IInvoiceService {
    bulkCreateOrUpdateInvoice(payload: CreateOrUpdateInvoicesDTO): Promise<Invoice[]>;
    getInvoiceById(id: string): Promise<Invoice>;
    getInvoicesForCompany(payload: GetCompanyInvoicesDTO): Promise<Invoice[]>;
    sumInvoicesByCompanyAndDateRange(payload: GetCompanyInvoicesByDateDTO): Promise<number>;
    sumInvoicesByCompanyInMonthBins(
        payload: GetCompanyInvoicesByDateDTO
    ): Promise<GetCompanyInvoicesInMonthBinsResponse>;
}

export class InvoiceService implements IInvoiceService {
    private invoiceTransaction: IInvoiceTransaction;
    private companyTransaction: ICompanyTransaction;

    constructor(invoiceTransaction: IInvoiceTransaction, companyTransaction: ICompanyTransaction) {
        this.invoiceTransaction = invoiceTransaction;
        this.companyTransaction = companyTransaction;
    }

    bulkCreateOrUpdateInvoice = withServiceErrorHandling(
        async (payload: CreateOrUpdateInvoicesDTO): Promise<Invoice[]> => {
            const uniqueCompanyIds = [...new Set(payload.map((inv) => inv.companyId))];

            // validate all uuids as being properly formatted
            const badIds = uniqueCompanyIds.filter((id) => !validate(id));

            if (badIds.length) {
                throw Boom.badRequest(`Invalid uuid format: ${badIds.join(", ")}`);
            }

            // make sure all those companies actually exist in the DB to get a decent error message
            const missingIds = await this.companyTransaction.validateCompaniesExist(uniqueCompanyIds);

            if (missingIds.length !== 0) {
                throw Boom.badRequest(`Companies not found: ${missingIds.join(", ")}`);
            }

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
            throw Boom.notFound("Invoice not found");
        }

        return invoice;
    });

    getInvoicesForCompany = withServiceErrorHandling(async (payload: GetCompanyInvoicesDTO): Promise<Invoice[]> => {
        const invoices = await this.invoiceTransaction.getInvoicesForCompany(payload);

        return invoices;
    });

    sumInvoicesByCompanyAndDateRange = withServiceErrorHandling(
        async (payload: GetCompanyInvoicesByDateDTO): Promise<number> => {
            const invoices = await this.invoiceTransaction.sumInvoicesByCompanyAndDateRange(payload);

            return invoices;
        }
    );

    sumInvoicesByCompanyInMonthBins = withServiceErrorHandling(
        async (payload: GetCompanyInvoicesByDateDTO): Promise<GetCompanyInvoicesInMonthBinsResponse> => {
            const perMonthSums = await this.invoiceTransaction.sumInvoicesByCompanyInMonthBins(payload);

            return perMonthSums;
        }
    );
}
