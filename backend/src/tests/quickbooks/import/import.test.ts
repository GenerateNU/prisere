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
import { Invoice } from "../../../entities/Invoice";
import dayjs from "dayjs";
import { InvoiceTransaction } from "../../../modules/invoice/transaction";
import { InvoiceLineItemTransaction } from "../../../modules/invoiceLineItem/transaction";
import { QBInvoice, QBPurchase } from "../../../types/quickbooks";
import { PurchaseTransaction } from "../../../modules/purchase/transaction";
import { PurchaseLineItemTransaction } from "../../../modules/purchase-line-item/transaction";
import QuickbooksSeeder from "../../../database/seeds/quickbooks.seed";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../../database/seeds/company.seed";
import UserSeeder from "../../../database/seeds/user.seed";
import { Purchase } from "../../../entities/Purchase";
import { PurchaseLineItem } from "../../../entities/PurchaseLineItem";

describe("Import quickbooks data", () => {
    const now = dayjs().toISOString();

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
        // Note: Don't run InvoiceSeeder in beforeEach since it adds test data, add in tests
    });

    it("should import both invoices and purchases successfully", async () => {
        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 100.0,
                    CustomerRef: {
                        name: "test-cust",
                    },
                    Line: [
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.0,
                            Id: "1",
                            Description: "Testing description",
                        },
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.5,
                            Id: "2",
                            Description: "Testing description 2",
                        },
                    ],
                },
            ],
        });

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 50.0,
                    Line: [
                        {
                            DetailType: "AccountBasedExpenseLineDetail",
                            AccountBasedExpenseLineDetail: {
                                AccountRef: { value: "acc-ref" },
                            },
                            Amount: 50.0,
                            Id: "1",
                            Description: "Test Purchase",
                        },
                    ],
                },
            ],
        });

        await service.importQuickbooksData({ userId });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoices).toBeArrayOfSize(1);
        expect(invoices[0].totalAmountCents).toBe(10000);

        const purchases = await db.getRepository(Purchase).find({ where: { companyId } });
        expect(purchases).toBeArrayOfSize(1);
        expect(purchases[0].totalAmountCents).toBe(5000);
    });

    it("should import when only invoices are returned", async () => {
        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 100.0,
                    CustomerRef: {
                        name: "test-cust",
                    },
                    Line: [
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.0,
                            Id: "1",
                            Description: "Testing description",
                        },
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.5,
                            Id: "2",
                            Description: "Testing description 2",
                        },
                    ],
                },
            ],
        });

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [],
        });

        await service.importQuickbooksData({ userId });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoices).toBeArrayOfSize(1);

        const purchases = await db.getRepository(Purchase).find({ where: { companyId } });
        expect(purchases).toBeArrayOfSize(0);
    });

    it("should import when only purchases are returned", async () => {
        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [],
        });

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 75.0,
                    Line: [
                        {
                            DetailType: "ItemBasedExpenseLineDetail",
                            ItemBasedExpenseLineDetail: {
                                TaxInclusiveAmt: 75.0,
                                CustomerRef: { value: "cust-ref" },
                            },
                            Id: "1",
                        },
                    ],
                },
            ],
        });

        await service.importQuickbooksData({ userId });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoices).toBeArrayOfSize(0);

        const purchases = await db.getRepository(Purchase).find({ where: { companyId } });
        expect(purchases).toBeArrayOfSize(1);
        expect(purchases[0].totalAmountCents).toBe(7500);
    });

    it("should handle empty response successfully", async () => {
        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [],
        });

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [],
        });

        // Verify it was completed but no errores are thrown (For the current setup)
        await service.importQuickbooksData({ userId });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoices).toBeArrayOfSize(0);

        const purchases = await db.getRepository(Purchase).find({ where: { companyId } });
        expect(purchases).toBeArrayOfSize(0);
    });

    it("should import multiple invoices and purchases", async () => {
        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 100.0,
                    CustomerRef: {
                        name: "test-cust",
                    },
                    Line: [
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.0,
                            Id: "1",
                            Description: "Testing description",
                        },
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.5,
                            Id: "2",
                            Description: "Testing description 2",
                        },
                    ],
                },
                {
                    Id: "2",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 200.0,
                    CustomerRef: {
                        name: "test-cust",
                    },
                    Line: [
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.0,
                            Id: "1",
                            Description: "Testing description",
                        },
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 5.5,
                            Id: "2",
                            Description: "Testing description 2",
                        },
                    ],
                },
            ],
        });

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 50.0,
                    Line: [
                        {
                            DetailType: "AccountBasedExpenseLineDetail",
                            AccountBasedExpenseLineDetail: {
                                AccountRef: { value: "acc-1" },
                            },
                            Amount: 50.0,
                            Id: "1",
                        },
                    ],
                },
                {
                    Id: "2",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 75.0,
                    Line: [
                        {
                            DetailType: "AccountBasedExpenseLineDetail",
                            AccountBasedExpenseLineDetail: {
                                AccountRef: { value: "acc-2" },
                            },
                            Amount: 75.0,
                            Id: "2",
                        },
                    ],
                },
            ],
        });

        await service.importQuickbooksData({ userId });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoices).toBeArrayOfSize(2);

        const purchases = await db.getRepository(Purchase).find({ where: { companyId } });
        expect(purchases).toBeArrayOfSize(2);
    });

    it("should handle line items with various amounts correctly", async () => {
        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [],
        });

        mockQuerySuccessReturn<{ Purchase: QBPurchase[] }>(client, {
            Purchase: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 19.99,
                    Line: [
                        {
                            DetailType: "AccountBasedExpenseLineDetail",
                            AccountBasedExpenseLineDetail: {
                                AccountRef: { value: "acc-ref" },
                            },
                            Amount: 19.99,
                            Id: "1",
                            Description: "Fractional amount test",
                        },
                    ],
                },
            ],
        });

        await service.importQuickbooksData({ userId });

        const lineItems = await db.getRepository(PurchaseLineItem).find();
        expect(lineItems).toBeArrayOfSize(1);
        expect(lineItems[0].amountCents).toBe(1999); // Should be rounded: 19.99 * 100 = 1999 cents
    });
});
