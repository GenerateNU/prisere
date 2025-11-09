import { QuickbooksTransaction } from "../../modules/quickbooks/transaction";
import { UserTransaction } from "../../modules/user/transaction";
import { InvoiceTransaction } from "../../modules/invoice/transaction";
import { InvoiceLineItemTransaction } from "../../modules/invoiceLineItem/transaction";
import { PurchaseTransaction } from "../../modules/purchase/transaction";
import { PurchaseLineItemTransaction } from "../../modules/purchase-line-item/transaction";
import { MockQBClient } from "../quickbooks/oauth/mock-client";
import { QuickbooksService } from "../../modules/quickbooks/service";
import type { DataSource } from "typeorm";

export function createTestQuickbooksService(dataSource: DataSource) {
    const transaction = new QuickbooksTransaction(dataSource);
    const userTransaction = new UserTransaction(dataSource);
    const invoiceTransaction = new InvoiceTransaction(dataSource);
    const invoiceLineItemTransaction = new InvoiceLineItemTransaction(dataSource);
    const purchaseTransaction = new PurchaseTransaction(dataSource);
    const purchaseLineItemTransaction = new PurchaseLineItemTransaction(dataSource);
    const client = new MockQBClient();
    return new QuickbooksService(
        transaction,
        userTransaction,
        invoiceTransaction,
        invoiceLineItemTransaction,
        purchaseTransaction,
        purchaseLineItemTransaction,
        client
    );
}
