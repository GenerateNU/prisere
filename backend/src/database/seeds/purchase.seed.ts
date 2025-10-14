import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { Purchase } from "../../entities/Purchase";

export const seededPurchases = [
    {
        id: "89cac778-b8d8-48c2-a2da-77019c57944e",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickBooksId: 108347,
        totalAmountCents: 1234,
        isRefund: true,
        dateCreated: new Date("2025-02-05T12:00:00Z"),
        quickbooksDateCreated: new Date("2025-02-05T12:00:00Z"),
    },
    {
        id: "1ffac23a-aefa-45ef-b0bd-b2b72ceae12e",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickBooksId: 2108347,
        totalAmountCents: 5678,
        isRefund: false,
        dateCreated: new Date("2025-01-11T12:00:00Z"),
        quickbooksDateCreated: new Date("2025-01-11T12:00:00Z"),
    },
    {
        id: "840b4c83-f46b-4774-96c1-2f11959d45eb",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickbooksId: 2108346,
        totalAmountCents: 456,
        isRefund: false,
        dateCreated: new Date("2025-01-09T12:00:00Z"),
        quickbooksDateCreated: new Date("2025-01-09T12:00:00Z"),
    },
    {
        id: "013417a7-f85c-4440-b171-b461227446e5",
        companyId: "ffc8243b-876e-4b6d-8b80-ffc73522a838",
        quickbooksId: 2108344,
        totalAmountCents: 50,
        isRefund: false,
        dateCreated: new Date("2024-04-11T12:00:00Z"),
        quickbooksDateCreated: new Date("2024-04-11T12:00:00Z"),
    },
];

export class PurchaseSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(Purchase, seededPurchases);
    }
}
