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
import { InvoiceLineItem } from "../../../entities/InvoiceLineItem";
import { InvoiceTransaction } from "../../../modules/invoice/transaction";
import { InvoiceLineItemTransaction } from "../../../modules/invoiceLineItem/transaction";
import { QBInvoice } from "../../../types/quickbooks";
import { PurchaseTransaction } from "../../../modules/purchase/transaction";
import { PurchaseLineItemTransaction } from "../../../modules/purchase-line-item/transaction";
import QuickbooksSeeder from "../../../database/seeds/quickbooks.seed";
import { SeederFactoryManager } from "typeorm-extension";
import CompanySeeder from "../../../database/seeds/company.seed";
import UserSeeder from "../../../database/seeds/user.seed";

describe("inserting invoice data", () => {
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

    it("should create a new invoice", async () => {
        const now = new Date().toISOString();

        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 10.5,
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

        await service.updateUnprocessedInvoices({ userId });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoices).toBeArrayOfSize(1);
        expect(invoices[0]).toEqual({
            companyId,
            quickbooksId: 1,
            quickbooksDateCreated: new Date(now),
            totalAmountCents: 1050,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });

        const lineItems = await db.getRepository(InvoiceLineItem).find({ where: { invoiceId: invoices[0].id } });
        expect(lineItems).toBeArrayOfSize(2);
        lineItems.sort((i1, i2) => i1.quickbooksId - i2.quickbooksId);
        expect(lineItems[0]).toEqual({
            quickbooksId: 1,
            amountCents: 500,
            invoiceId: invoices[0].id,
            category: "test-cust",
            description: "Testing description",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
        expect(lineItems[1]).toEqual({
            quickbooksId: 2,
            amountCents: 550,
            invoiceId: invoices[0].id,
            category: "test-cust",
            description: "Testing description 2",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });

    it("should update an existing invoice when it changes", async () => {
        const oneDayAgo = dayjs().subtract(1, "day").toISOString();

        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: oneDayAgo, LastUpdatedTime: oneDayAgo },
                    TotalAmt: 10.5,
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

        await service.updateUnprocessedInvoices({ userId });

        const invoicesBefore = await db.getRepository(Invoice).find({ where: { companyId: companyId } });
        expect(invoicesBefore).toBeArrayOfSize(1);
        const lineItemsBefore = await db
            .getRepository(InvoiceLineItem)
            .find({ where: { invoiceId: invoicesBefore[0].id } });
        expect(lineItemsBefore).toBeArrayOfSize(2);

        const now = dayjs().toISOString();
        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: oneDayAgo, LastUpdatedTime: now },
                    TotalAmt: 15.5,
                    CustomerRef: {
                        name: "test-cust",
                    },
                    Line: [
                        {
                            DetailType: "SalesLineItemDetail",
                            Amount: 10.0,
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

        await service.updateUnprocessedInvoices({ userId });

        const invoicesAfter = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoicesAfter).toBeArrayOfSize(1);
        expect(invoicesAfter[0]).toEqual({
            companyId,
            quickbooksId: 1,
            quickbooksDateCreated: new Date(oneDayAgo),
            totalAmountCents: 1550,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });

        const lineItemsAfter = await db
            .getRepository(InvoiceLineItem)
            .find({ where: { invoiceId: invoicesAfter[0].id } });
        expect(lineItemsAfter).toBeArrayOfSize(2);
        lineItemsAfter.sort((i1, i2) => i1.quickbooksId - i2.quickbooksId);
        expect(lineItemsAfter[0]).toEqual({
            quickbooksId: 1,
            amountCents: 1000,
            invoiceId: invoicesAfter[0].id,
            category: "test-cust",
            description: "Testing description",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
        expect(lineItemsAfter[1]).toEqual({
            quickbooksId: 2,
            amountCents: 550,
            invoiceId: invoicesAfter[0].id,
            category: "test-cust",
            description: "Testing description 2",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });

    it("should destructure a grouped line item", async () => {
        const now = new Date().toISOString();

        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 10.5,
                    CustomerRef: {
                        name: "test-cust",
                    },
                    Line: [
                        {
                            DetailType: "GroupLineDetail",
                            Id: "1",
                            Description: "Group dsecription",
                            GroupLineDetail: {
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
                        },
                    ],
                },
            ],
        });

        await service.updateUnprocessedInvoices({ userId });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId } });
        expect(invoices).toBeArrayOfSize(1);
        expect(invoices[0]).toEqual({
            companyId,
            quickbooksId: 1,
            quickbooksDateCreated: new Date(now),
            totalAmountCents: 1050,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });

        const lineItems = await db.getRepository(InvoiceLineItem).find({ where: { invoiceId: invoices[0].id } });
        expect(lineItems).toBeArrayOfSize(2);
        lineItems.sort((i1, i2) => i1.quickbooksId - i2.quickbooksId);
        expect(lineItems[0]).toEqual({
            quickbooksId: 1,
            amountCents: 500,
            invoiceId: invoices[0].id,
            category: "test-cust",
            description: "Testing description",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
        expect(lineItems[1]).toEqual({
            quickbooksId: 2,
            amountCents: 550,
            invoiceId: invoices[0].id,
            category: "test-cust",
            description: "Testing description 2",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });
});
