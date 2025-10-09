import { DataSource } from "typeorm";
import Boom from "@hapi/boom";
import { plainToInstance } from "class-transformer";
import { InvoiceLineItem } from "../../entities/InvoiceLineItem";
import { CreateOrUpdateInvoiceLineItemsDTO } from "../../types/InvoiceLineItem";

export interface IInvoiceLineItemTransaction {
    createOrUpdateInvoiceLineItems(payload: CreateOrUpdateInvoiceLineItemsDTO): Promise<InvoiceLineItem[]>;
    getInvoiceLineItemById(id: string): Promise<InvoiceLineItem>;
    getInvoiceLineItemsForInvoice(invoiceId: string): Promise<InvoiceLineItem[]>;
}

export class InvoiceLineItemTransaction implements IInvoiceLineItemTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createOrUpdateInvoiceLineItems(payload: CreateOrUpdateInvoiceLineItemsDTO): Promise<InvoiceLineItem[]> {
        const newInvoices = payload.map((invoice) => plainToInstance(InvoiceLineItem, invoice));
        const result = await this.db
            .createQueryBuilder()
            .insert()
            .into(InvoiceLineItem)
            .values(newInvoices)
            .orUpdate(["description", "amountCents", "category", "quickbooksDateCreated"], ["quickbooksId", "invoiceId"])
            .returning("*")
            .execute();
        return result.raw;
    }

    async getInvoiceLineItemById(id: string): Promise<InvoiceLineItem> {
        const result: InvoiceLineItem | null = await this.db.getRepository(InvoiceLineItem).findOneBy({ id: id });

        if (!result) {
            throw Boom.notFound(`No invoice line items found with id: ${id}`);
        }

        return result;
    }
    async getInvoiceLineItemsForInvoice(invoiceId: string): Promise<InvoiceLineItem[]> {
        const invoiceLineItems: InvoiceLineItem[] = await this.db.getRepository(InvoiceLineItem).find({
            where: { invoiceId: invoiceId },
            order: {
                quickbooksDateCreated: "DESC",
            },
        });

        return invoiceLineItems;
    }
}
