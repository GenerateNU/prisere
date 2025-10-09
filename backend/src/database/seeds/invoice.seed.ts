import { DataSource } from "typeorm";
import { Invoice } from "../../entities/Invoice";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export const seededInvoices = [
    {
        id: "c99c289f-ddce-4176-bf31-2cbb31b079e9",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickbooksId: 3,
        totalAmountCents: 45,
        dateCreated: new Date("2025-04-11T12:00:00Z"),
    },
    {
        id: "1b53822d-eae9-4948-aaaf-c71c4adcdb5a",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickbooksId: 1,
        totalAmountCents: 234,
        dateCreated: new Date("2025-02-05T12:00:00Z"),
    },
    {
        id: "840b4c83-f46b-4774-96c1-2f11959d45eb",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickbooksId: 2,
        totalAmountCents: 456,
        dateCreated: new Date("2025-01-11T12:00:00Z"),
    },
    {
        id: "013417a7-f85c-4440-b171-b461227446e5",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickbooksId: 4,
        totalAmountCents: 50,
        dateCreated: new Date("2024-04-11T12:00:00Z"),
    },
];

export class InvoiceSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        const repository = dataSource.getRepository(Invoice);
        await repository.insert(seededInvoices);
    }
}
