import { Brackets, DataSource, In } from "typeorm";
import Boom from "@hapi/boom";
import { plainToInstance } from "class-transformer";
import { Invoice } from "../../entities/Invoice";
import {
    CreateOrUpdateInvoicesDTO,
    GetCompanyInvoicesDTO,
    GetCompanyInvoicesByDateDTO,
    GetCompanyInvoicesInMonthBinsResponse,
} from "../../types/Invoice";

export interface IInvoiceTransaction {
    createOrUpdateInvoices(payload: CreateOrUpdateInvoicesDTO): Promise<Invoice[]>;
    getInvoiceById(id: string): Promise<Invoice>;
    getInvoicesForCompany(payload: GetCompanyInvoicesDTO): Promise<Invoice[]>;
    sumInvoicesByCompanyAndDateRange(payload: GetCompanyInvoicesByDateDTO): Promise<number>;
    sumInvoicesByCompanyInMonthBins(
        payload: GetCompanyInvoicesByDateDTO
    ): Promise<GetCompanyInvoicesInMonthBinsResponse>;

    /**
     * Validates that all the passed invoice IDs exist in the database
     * @param invoiceIds the invoice ids to make sure exist in the DB
     *
     * Will return a list of all invoice ids not present in the DB
     * So an empty list means all are valid
     */
    validateInvoicesExist(invoiceIds: string[]): Promise<string[]>;
}

export class InvoiceTransaction implements IInvoiceTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createOrUpdateInvoices(payload: CreateOrUpdateInvoicesDTO): Promise<Invoice[]> {
        const newInvoices = payload.map((invoice) => plainToInstance(Invoice, invoice));
        const result = await this.db
            .createQueryBuilder()
            .insert()
            .into(Invoice)
            .values(newInvoices)
            .orUpdate(["totalAmountCents", "quickbooksDateCreated"], ["quickbooksId", "companyId"])
            .returning("*")
            .execute();
        return result.raw;
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
                quickbooksDateCreated: "DESC",
            },
        });

        return invoices;
    }

    async validateInvoicesExist(invoiceIds: string[]): Promise<string[]> {
        const invoices = await this.db.getRepository(Invoice).findBy({ id: In(invoiceIds) });
        if (invoices.length !== invoiceIds.length) {
            const foundIds = invoices.map((c) => c.id);
            const missing = invoiceIds.filter((id) => !foundIds.includes(id));
            return missing;
        }
        return [];
    }

    async sumInvoicesByCompanyAndDateRange(payload: GetCompanyInvoicesByDateDTO): Promise<number> {
        const { companyId, startDate, endDate } = payload;

        const summation = await this.db
            .createQueryBuilder(Invoice, "invoice")
            .select("SUM(invoice.totalAmountCents)", "total")
            .where("invoice.companyId = :companyId", { companyId })
            .andWhere(
                new Brackets((qb) => {
                    qb.where("invoice.quickbooksDateCreated BETWEEN :startDate AND :endDate", {
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                    }).orWhere(
                        "invoice.quickbooksDateCreated IS NULL AND invoice.dateCreated BETWEEN :startDate AND :endDate",
                        {
                            startDate: new Date(startDate),
                            endDate: new Date(endDate),
                        }
                    );
                })
            )
            .getRawOne();

        const totalCents: number = summation?.total || 0;

        return totalCents;
    }

    async sumInvoicesByCompanyInMonthBins(
        payload: GetCompanyInvoicesByDateDTO
    ): Promise<GetCompanyInvoicesInMonthBinsResponse> {
        const { companyId, startDate, endDate } = payload;

        const results = await this.db
            .createQueryBuilder(Invoice, "invoice")
            .select([
                // used EXTRACT here rather than TO_CHAR because pg-mem does not support TO_CHAR
                "EXTRACT(YEAR FROM invoice.quickbooksDateCreated) as year",
                "EXTRACT(MONTH FROM invoice.quickbooksDateCreated) as month",
                "SUM(invoice.totalAmountCents) as total",
            ])
            .where({ companyId: companyId })
            .andWhere("invoice.quickbooksDateCreated BETWEEN :startDate AND :endDate", {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            })
            .groupBy(
                "EXTRACT(YEAR FROM invoice.quickbooksDateCreated), EXTRACT(MONTH FROM invoice.quickbooksDateCreated)"
            )
            .orderBy("year", "ASC")
            .addOrderBy("month", "ASC")
            .getRawMany();

        return results.map((row) => ({
            month: `${row.year}-${String(row.month).padStart(2, "0")}`,
            total: parseInt(row.total) || 0,
        }));
    }
}
