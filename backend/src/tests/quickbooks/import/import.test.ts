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
import { InvoiceSeeder } from "../../../database/seeds/invoice.seed";

describe("Import quickbooks data", () => {
    const oneDayAgo = dayjs().subtract(1, "day").toISOString();
    
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
        const invoiceSeeder = new InvoiceSeeder();
        invoiceSeeder.run(db, {} as SeederFactoryManager);
    });

    // it("Should import new purchase and invoice data", async () => {
    //     // Mock a valid QuickBooks response with empty Invoice array
    //     mockQuerySuccessReturn(client, {
    //         
    //     });
    //     expect(service.importQuickbooksData({ userId })).resolves.not.toThrow();
    // });
});
