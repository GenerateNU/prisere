import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { InvoiceLineItem } from "../../entities/InvoiceLineItem";
import { seededInvoices } from "./invoice.seed";

export const seededInvoiceLineItems = [
    {
        id: "3a8f91bb-c3d5-4eb5-a3af-c35451fefaa6",
        description: "inv1: line item 1",
        invoiceId: seededInvoices[0].id,
        quickbooksId: 3,
        amountCents: 234,
        dateCreated: new Date("2025-02-05T12:00:00Z"),
        category: "CAT_1"
    },
    {
        id: "944d3db6-1b6f-49fd-88d5-ebb3e7a42ab5",
        description: "inv1: line item 2",
        invoiceId: seededInvoices[0].id,
        quickbooksId: 4,
        amountCents: 456,
        dateCreated: new Date("2025-01-11T12:00:00Z"),
        category: "CAT_2"
    },
    {
        id: "3a8f91bb-c3d5-4eb5-a3af-c35451fefaa6",
        description: "inv2: line item 1",
        invoiceId: seededInvoices[1].id,
        quickbooksId: 5,
        amountCents: 234,
        dateCreated: new Date("2025-02-05T12:00:00Z"),
        category: "CAT_1"
    },
    {
        id: "944d3db6-1b6f-49fd-88d5-ebb3e7a42ab5",
        description: "inv2: line item 2",
        invoiceId: seededInvoices[1].id,
        quickbooksId: 6,
        amountCents: 456,
        dateCreated: new Date("2025-01-11T12:00:00Z"),
        category: "CAT_2"
    },
];

export class InvoiceLineItemSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(InvoiceLineItem);
        await repository.insert(seededInvoiceLineItems);
    }
}
