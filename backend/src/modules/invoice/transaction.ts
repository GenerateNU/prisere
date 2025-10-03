import { DataSource } from "typeorm";
import Boom from "@hapi/boom";
import { plainToInstance } from "class-transformer";
import { Invoice } from "../../entities/Invoice";
import { CreateOrUpdateInvoiceDTO, GetCompanyInvoicesDTO } from "../../types/Invoice";

export interface IInvoiceTransaction {
    createOrUpdateInvoice(payload: CreateOrUpdateInvoiceDTO): Promise<Invoice>;
    getInvoiceById(id: string): Promise<Invoice>;
    getInvoicesForCompany(payload: GetCompanyInvoicesDTO): Promise<Invoice[]>;
}

export class InvoiceTransaction implements IInvoiceTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createOrUpdateInvoice(payload: CreateOrUpdateInvoiceDTO): Promise<Invoice> {
        const newInvoice = plainToInstance(Invoice, payload);
        const result = await this.db
            .createQueryBuilder()
            .insert()
            .into(Invoice)
            .values(newInvoice)
            .orUpdate(['totalAmountCents', 'dateCreated'], ['quickbooksId', 'companyId'])
            .returning('*')
            .execute();

        return result.raw[0];
    }

    async getInvoiceById(id: string): Promise<Invoice> {
        const result: Invoice | null = await this.db.getRepository(Invoice).findOneBy({ id: id });

        if (!result) {
            throw Boom.notFound(`No invoices found with id: ${id}`);
        }

        return result;
    }
    async getInvoicesForCompany(payload: GetCompanyInvoicesDTO): Promise<Invoice[]> {
        const { companyId, pageNumber, resultsPerPage } = payload;
        const numToSkip = resultsPerPage * pageNumber;
        const invoices: Invoice[] = await this.db.getRepository(Invoice).find({
            where: { companyId: companyId },
            skip: numToSkip,
            take: resultsPerPage,
            order: {
                dateCreated: 'DESC',
            },
        });

        return invoices;
    }
}