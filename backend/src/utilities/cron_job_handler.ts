import { CronJob } from "cron";
import { IFemaService } from "../modules/clients/fema-client/service";
import { DisasterNotificationService, IDisasterNotificationService } from "../modules/disasterNotifications/service";
import { DataSource } from "typeorm";
import {
    DisasterNotificationTransaction,
    IDisasterNotificationTransaction,
} from "../modules/disasterNotifications/transaction";
import { logMessageToFile } from "./logger";
import { ILocationAddressTransaction, LocationAddressTransactions } from "../modules/location-address/transaction";
import { IPreferenceTransaction, PreferenceTransaction } from "../modules/preferences/transaction";
import { ISQSService, SQSService } from "../modules/sqs/service";
import { IQuickbooksService, QuickbooksService } from "../modules/quickbooks/service";
import { IQuickbooksTransaction, QuickbooksTransaction } from "../modules/quickbooks/transaction";
import { IUserTransaction, UserTransaction } from "../modules/user/transaction";
import { IInvoiceTransaction, InvoiceTransaction } from "../modules/invoice/transaction";
import { IInvoiceLineItemTransaction, InvoiceLineItemTransaction } from "../modules/invoiceLineItem/transaction";
import { IPurchaseTransaction, PurchaseTransaction } from "../modules/purchase/transaction";
import { IPurchaseLineItemTransaction, PurchaseLineItemTransaction } from "../modules/purchase-line-item/transaction";
import { IQuickbooksClient, QuickbooksClient } from "../external/quickbooks/client";

export interface CronJobHandler {
    initializeCron(): CronJob;
}

export class FemaFetching implements CronJobHandler {
    private femaService: IFemaService;
    private disasterNotificationTransaction: IDisasterNotificationTransaction;
    private disasterNotificationService: IDisasterNotificationService;
    private locationTransaction: ILocationAddressTransaction;
    private userPreferencesTransaction: IPreferenceTransaction;
    private sqsService: ISQSService;
    private quickbooksTransaction: IQuickbooksTransaction;
    private userTransaction: IUserTransaction;
    private invoiceTransaction: IInvoiceTransaction
    private invoiceLineItemTransaction: IInvoiceLineItemTransaction;
    private purchaseTransaction: IPurchaseTransaction;
    private purchaseLineItemTransaction: IPurchaseLineItemTransaction;
    private qbClient: IQuickbooksClient;
    private quickbooksService: IQuickbooksService;

    constructor(femaService: IFemaService, db: DataSource) {
        this.femaService = femaService;
        this.disasterNotificationTransaction = new DisasterNotificationTransaction(db);
        this.locationTransaction = new LocationAddressTransactions(db);
        this.userPreferencesTransaction = new PreferenceTransaction(db);
        this.sqsService = new SQSService();
        this.quickbooksTransaction = new QuickbooksTransaction(db);
        this.userTransaction = new UserTransaction(db);
        this.invoiceTransaction = new InvoiceTransaction(db);
        this.invoiceLineItemTransaction = new InvoiceLineItemTransaction(db);
        this.purchaseTransaction = new PurchaseTransaction(db);
        this.purchaseLineItemTransaction = new PurchaseLineItemTransaction(db);
        this.qbClient = new QuickbooksClient({
            clientId: process.env.QUICKBOOKS_CLIENT_ID!,
            clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
            environment: process.env.NODE_ENV == 'dev' ? "sandbox" : "production",
        });
        
        this.quickbooksService = new QuickbooksService(this.quickbooksTransaction,
            this.userTransaction,
            this.invoiceTransaction,
            this.invoiceLineItemTransaction,
            this.purchaseTransaction,
            this.purchaseLineItemTransaction,
            this.qbClient
        )

        this.disasterNotificationService = new DisasterNotificationService(
            this.disasterNotificationTransaction,
            this.locationTransaction,
            this.userPreferencesTransaction,
            this.sqsService
        );
    }

    initializeCron(): CronJob {
        const lastRefreshDate = new Date();
        lastRefreshDate.setDate(lastRefreshDate.getDate() - 1);
        return CronJob.from({
            cronTime: "0 2 * * *",
            onTick: async () => {
                const newDisasters = await this.femaService.fetchFemaDisasters({ lastRefreshDate: lastRefreshDate });
                logMessageToFile(`Going to process ${newDisasters.length} new FEMA Disasters.`);
                await this.disasterNotificationService.processNewDisasters(newDisasters, this.quickbooksService);
            },
            start: true,
            timeZone: "America/New_York",
            runOnInit: true,
        });
    }
}
