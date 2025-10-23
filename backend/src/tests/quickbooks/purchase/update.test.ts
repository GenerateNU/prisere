import { afterEach, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { QuickbooksService } from "../../../modules/quickbooks/service";
import { startTestApp } from "../../setup-tests";
import { QuickbooksTransaction } from "../../../modules/quickbooks/transaction";
import { UserTransaction } from "../../../modules/user/transaction";
import { MockQBClient } from "../oauth/mock-client";
import { IQuickbooksClient } from "../../../external/quickbooks/client";
import { mockQuerySuccessReturn } from "../utis";
import dayjs from "dayjs";
import { InvoiceTransaction } from "../../../modules/invoice/transaction";
import { InvoiceLineItemTransaction } from "../../../modules/invoiceLineItem/transaction";
import { QBPurchase } from "../../../types/quickbooks";
import { PurchaseTransaction } from "../../../modules/purchase/transaction";
import { PurchaseLineItemTransaction } from "../../../modules/purchase-line-item/transaction";
import QuickbooksSeeder from "../../../database/seeds/quickbooks.seed";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../../database/seeds/company.seed";
import UserSeeder from "../../../database/seeds/user.seed";
import { Purchase } from "../../../entities/Purchase";
import { PurchaseLineItem, PurchaseLineItemType } from "../../../entities/PurchaseLineItem";

describe("inserting purcahse data", () => {
    let db: DataSource;
    let backup: IBackup;

    let client: IQuickbooksClient;
    let service: QuickbooksService;

    const companyId = QuickbooksSeeder.COMPANY_ID;
    const userId = QuickbooksSeeder.USER_ID;

    beforeAll(async () => {
        ({ backup, dataSource: db } = await startTestApp());

        const transaction = new QuickbooksTransaction(db);
        const userTransaction = new UserTransaction(db);
        const invoiceTransaction = new InvoiceTransaction(db);
        const invoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
        const purchaseTransaction = new PurchaseTransaction(db);
        const purchaseLineItemTransaction = new PurchaseLineItemTransaction(db);
        client = new MockQBClient();
        service = new QuickbooksService(
            transaction,
            userTransaction,
            invoiceTransaction,
            invoiceLineItemTransaction,
            purchaseTransaction,
            purchaseLineItemTransaction,
            client
        );
    });

    afterEach(() => {
        backup.restore();
    });

    beforeEach(async () => {
        const companySeeder = new CompanySeeder();
        await companySeeder.run(db, {} as SeederFactoryManager);
        const qbSeeder = new QuickbooksSeeder();
        await qbSeeder.run(db, {} as SeederFactoryManager);
        const userSeeder = new UserSeeder();
        await userSeeder.run(db, {} as SeederFactoryManager);
    });

    it("should create a new purchase", async () => {
        const now = new Date().toISOString();

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 10.5,
                    Line: [
                        {
                            DetailType: "ItemBasedExpenseLineDetail",
                            ItemBasedExpenseLineDetail: {
                                TaxInclusiveAmt: 5.0,
                                CustomerRef: {
                                    value: "cust-ref",
                                },
                            },
                            Id: "1",
                            Description: "Testing description",
                        },
                        {
                            DetailType: "AccountBasedExpenseLineDetail",
                            AccountBasedExpenseLineDetail: {
                                AccountRef: {
                                    value: "acc-ref",
                                },
                            },
                            Amount: 5.5,
                            Id: "2",
                            Description: "Testing description 2",
                        },
                    ],
                    Credit: true,
                },
            ],
        });

        await service.updateUnprocessedPurchases({ userId });

        const purchases = await db.getRepository(Purchase).find({ where: { companyId } });
        expect(purchases).toBeArrayOfSize(1);
        expect(purchases[0]).toEqual({
            companyId,
            quickBooksId: 1,
            quickbooksDateCreated: new Date(now),
            totalAmountCents: 1050,
            isRefund: true,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });

        const lineItems = await db.getRepository(PurchaseLineItem).find({ where: { purchaseId: purchases[0].id } });
        expect(lineItems).toBeArrayOfSize(2);
        lineItems.sort((i1, i2) => (i1.quickBooksId ?? -1) - (i2.quickBooksId ?? -1));
        expect(lineItems[0]).toEqual({
            quickBooksId: 1,
            amountCents: 500,
            purchaseId: purchases[0].id,
            category: null,
            description: "Testing description",
            quickbooksDateCreated: new Date(now),
            type: PurchaseLineItemType.TYPICAL,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
        expect(lineItems[1]).toEqual({
            quickBooksId: 2,
            amountCents: 550,
            purchaseId: purchases[0].id,
            category: "acc-ref",
            description: "Testing description 2",
            quickbooksDateCreated: new Date(now),
            type: PurchaseLineItemType.TYPICAL,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });

    it("should update an existing purchase when it changes", async () => {
        const oneDayAgo = dayjs().subtract(1, "day").toISOString();

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [
                {
                    Id: "1",
                    MetaData: { CreateTime: oneDayAgo, LastUpdatedTime: oneDayAgo },
                    TotalAmt: 10.5,
                    Line: [
                        {
                            DetailType: "ItemBasedExpenseLineDetail",
                            ItemBasedExpenseLineDetail: {
                                TaxInclusiveAmt: 5.0,
                                CustomerRef: {
                                    value: "cust-ref",
                                },
                            },
                            Id: "1",
                            Description: "Testing description",
                        },
                        {
                            DetailType: "AccountBasedExpenseLineDetail",
                            AccountBasedExpenseLineDetail: {
                                AccountRef: {
                                    value: "acc-ref",
                                },
                            },
                            Amount: 5.5,
                            Id: "2",
                            Description: "Testing description 2",
                        },
                    ],
                },
            ],
        });

        await service.updateUnprocessedPurchases({ userId });

        const purchasesBefore = await db.getRepository(Purchase).find({ where: { companyId: companyId } });
        expect(purchasesBefore).toBeArrayOfSize(1);
        const lineItemsBefore = await db
            .getRepository(PurchaseLineItem)
            .find({ where: { purchaseId: purchasesBefore[0].id } });
        expect(lineItemsBefore).toBeArrayOfSize(2);

        const now = dayjs().toISOString();
        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [
                {
                    Id: "1",
                    MetaData: { CreateTime: oneDayAgo, LastUpdatedTime: now },
                    TotalAmt: 15.5,
                    Line: [
                        {
                            DetailType: "ItemBasedExpenseLineDetail",
                            ItemBasedExpenseLineDetail: {
                                TaxInclusiveAmt: 10.0,
                                CustomerRef: {
                                    value: "cust-ref",
                                },
                            },
                            Id: "1",
                            Description: "Testing description",
                        },
                        {
                            DetailType: "AccountBasedExpenseLineDetail",
                            AccountBasedExpenseLineDetail: {
                                AccountRef: {
                                    value: "acc-ref",
                                },
                            },
                            Amount: 5.5,
                            Id: "2",
                            Description: "Testing description 2",
                        },
                    ],
                },
            ],
        });

        await service.updateUnprocessedPurchases({ userId });

        const purchasesAfter = await db.getRepository(Purchase).find({ where: { companyId } });
        expect(purchasesAfter).toBeArrayOfSize(1);
        expect(purchasesAfter[0]).toEqual({
            companyId,
            quickBooksId: 1,
            quickbooksDateCreated: new Date(oneDayAgo),
            totalAmountCents: 1550,
            isRefund: false,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });

        const lineItemsAfter = await db
            .getRepository(PurchaseLineItem)
            .find({ where: { purchaseId: purchasesAfter[0].id } });
        expect(lineItemsAfter).toBeArrayOfSize(2);
        lineItemsAfter.sort((i1, i2) => (i1.quickBooksId ?? -1) - (i2.quickBooksId ?? -1));
        expect(lineItemsAfter[0]).toEqual({
            quickBooksId: 1,
            amountCents: 1000,
            purchaseId: purchasesAfter[0].id,
            category: null,
            description: "Testing description",
            quickbooksDateCreated: new Date(oneDayAgo),
            type: PurchaseLineItemType.TYPICAL,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
        expect(lineItemsAfter[1]).toEqual({
            quickBooksId: 2,
            amountCents: 550,
            purchaseId: purchasesAfter[0].id,
            category: "acc-ref",
            description: "Testing description 2",
            quickbooksDateCreated: new Date(oneDayAgo),
            type: PurchaseLineItemType.TYPICAL,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });
});
