import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { seededPurchases } from "./purchase.seed";
import { PurchaseLineItem, PurchaseLineItemType } from "../../entities/PurchaseLineItem";

export const seededPurchaseLineItems = [
    {
        id: "ba4635bf-d3ac-4d11-ac0e-82e658a96d5a",
        description: "Office supplies",
        quickBooksId: 999,
        purchaseId: seededPurchases[0].id,
        amountCents: 1234,
        category: "Supplies",
        type: PurchaseLineItemType.TYPICAL,
        dateCreated: new Date("2025-01-10T12:00:00Z"),
    },
    {
        id: "bf4c21aa-da49-42cc-9a50-749e70786f9f",
        description: "Software license",
        quickBooksId: 1000,
        purchaseId: seededPurchases[0].id,
        amountCents: 5678,
        category: "Technology",
        type: PurchaseLineItemType.EXTRANEOUS,
        dateCreated: new Date("2025-09-11T12:00:00Z"),
    },
    {
        id: "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
        description: "Paper and pens",
        quickBooksId: 1001,
        purchaseId: seededPurchases[4].id,
        amountCents: 2000,
        category: "Supplies",
        type: PurchaseLineItemType.TYPICAL,
        dateCreated: new Date("2025-03-01T12:00:00Z"),
    },
    {
        id: "d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a",
        description: "Computer hardware",
        quickBooksId: 1002,
        purchaseId: seededPurchases[5].id,
        amountCents: 3000,
        category: "Technology",
        type: PurchaseLineItemType.TYPICAL,
        dateCreated: new Date("2025-03-02T12:00:00Z"),
    },
];

export class PurchaseLineItemSeeder implements Seeder {
    track = false;
    public async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
        await dataSource.manager.insert(PurchaseLineItem, seededPurchaseLineItems);
    }
}
