import { Hono } from "hono";
import { afterEach, beforeAll, describe, expect, it } from "bun:test";
import { IBackup } from "pg-mem";
import { DataSource } from "typeorm";
import { QuickbooksService } from "../../../modules/quickbooks/service";
import { startTestApp } from "../../setup-tests";
import { QuickbooksTransaction } from "../../../modules/quickbooks/transaction";
import { UserTransaction } from "../../../modules/user/transaction";
import { MockQBClient } from "../oauth/mock-client";
import { createUserWithCompany, setupQuickbooksSession } from "../../utils";
import { randomUUID } from "crypto";
import { IQuickbooksClient } from "../../../external/quickbooks/client";
import { mockQuerySuccessReturn } from "../utis";
import { Invoice } from "../../../entities/Invoice";
import dayjs from "dayjs";
import { InvoiceLineItem } from "../../../entities/InvoiceLineItem";
import { InvoiceTransaction } from "../../../modules/invoice/transaction";
import { InvoiceLineItemTransaction } from "../../../modules/invoiceLineItem/transaction";
import { QBInvoice } from "../../../types/quickbooks";

describe("inserting invoice data", () => {
    let app: Hono;
    let db: DataSource;
    let backup: IBackup;

    let client: IQuickbooksClient;
    let service: QuickbooksService;

    beforeAll(async () => {
        ({ app, backup, dataSource: db } = await startTestApp());

        const transaction = new QuickbooksTransaction(db);
        const userTransaction = new UserTransaction(db);
        const invoiceTransaction = new InvoiceTransaction(db);
        const invoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
        client = new MockQBClient();
        service = new QuickbooksService(
            transaction,
            userTransaction,
            invoiceTransaction,
            invoiceLineItemTransaction,
            client
        );
    });

    afterEach(() => {
        backup.restore();
    });

    it("should create a new invoice", async () => {
        const { data } = await createUserWithCompany(app, {
            firstName: "test",
            lastName: "user",
            id: randomUUID(),
        });

        await setupQuickbooksSession(db, { companyId: data.companyId! });

        const now = new Date().toISOString();

        mockQuerySuccessReturn(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 10.5,
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

        await service.updateUnprocessedInvoices({ userId: data.id });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId: data.companyId! } });
        expect(invoices).toBeArrayOfSize(1);
        expect(invoices[0]).toEqual({
            companyId: data.companyId!,
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
            category: "",
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
            category: "",
            description: "Testing description 2",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });

    it("should update an existing invoice when it changes", async () => {
        const { data } = await createUserWithCompany(app, {
            firstName: "test",
            lastName: "user",
            id: randomUUID(),
        });

        await setupQuickbooksSession(db, { companyId: data.companyId! });

        const oneDayAgo = dayjs().subtract(1, "day").toISOString();

        mockQuerySuccessReturn(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: oneDayAgo, LastUpdatedTime: oneDayAgo },
                    TotalAmt: 10.5,
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

        await service.updateUnprocessedInvoices({ userId: data.id });

        const invoicesBefore = await db.getRepository(Invoice).find({ where: { companyId: data.companyId! } });
        expect(invoicesBefore).toBeArrayOfSize(1);
        const lineItemsBefore = await db
            .getRepository(InvoiceLineItem)
            .find({ where: { invoiceId: invoicesBefore[0].id } });
        expect(lineItemsBefore).toBeArrayOfSize(2);

        const now = dayjs().toISOString();
        mockQuerySuccessReturn(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: oneDayAgo, LastUpdatedTime: now },
                    TotalAmt: 15.5,
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

        await service.updateUnprocessedInvoices({ userId: data.id });

        const invoicesAfter = await db.getRepository(Invoice).find({ where: { companyId: data.companyId! } });
        expect(invoicesAfter).toBeArrayOfSize(1);
        expect(invoicesAfter[0]).toEqual({
            companyId: data.companyId!,
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
            category: "",
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
            category: "",
            description: "Testing description 2",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });

    it("should destructure a grouped line item", async () => {
        const { data } = await createUserWithCompany(app, {
            firstName: "test",
            lastName: "user",
            id: randomUUID(),
        });

        await setupQuickbooksSession(db, { companyId: data.companyId! });

        const now = new Date().toISOString();

        mockQuerySuccessReturn<{ Invoice: QBInvoice[] }>(client, {
            Invoice: [
                {
                    Id: "1",
                    MetaData: { CreateTime: now, LastUpdatedTime: now },
                    TotalAmt: 10.5,
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

        await service.updateUnprocessedInvoices({ userId: data.id });

        const invoices = await db.getRepository(Invoice).find({ where: { companyId: data.companyId! } });
        expect(invoices).toBeArrayOfSize(1);
        expect(invoices[0]).toEqual({
            companyId: data.companyId!,
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
            category: "",
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
            category: "",
            description: "Testing description 2",
            quickbooksDateCreated: null,
            id: expect.anything(),
            dateCreated: expect.anything(),
            lastUpdated: expect.anything(),
        });
    });
});
