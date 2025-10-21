import { afterEach, beforeAll, describe, expect, it, spyOn } from "bun:test";
import { Hono } from "hono";
import { DataSource } from "typeorm";
import { IBackup } from "pg-mem";
import { QuickbooksService } from "../../../modules/quickbooks/service";
import { startTestApp } from "../../setup-tests";
import { QuickbooksTransaction } from "../../../modules/quickbooks/transaction";
import { MockQBClient, setupData } from "./mock-client";
import { QuickbooksSession } from "../../../entities/QuickbookSession";
import dayjs from "dayjs";
import { IQuickbooksClient } from "../../../external/quickbooks/client";
import { UserTransaction } from "../../../modules/user/transaction";
import { QBQueryResponse, QBSuccessfulQueryResponse } from "../../../external/quickbooks/types";
import { QBInvoice } from "../../../types/quickbooks";
import { InvoiceTransaction } from "../../../modules/invoice/transaction";
import { InvoiceLineItemTransaction } from "../../../modules/invoiceLineItem/transaction";

describe("requesting from api", () => {
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

    it("should attempt to refresh access token when expired", async () => {
        const { user, companyId } = await setupData(app, service);

        const refreshSpy = spyOn(service, "refreshQuickbooksSession");
        spyOn(client, "query").mockImplementation(async <T>() => {
            return {
                _id: "valid",
                data: { QueryResponse: { Invoice: [] }, time: "" },
            } satisfies QBSuccessfulQueryResponse<{ Invoice: QBInvoice[] }> as unknown as QBQueryResponse<T>;
        });

        await service.updateUnprocessedInvoices({ userId: user.id });
        expect(refreshSpy).toBeCalledTimes(0);

        const now = dayjs();

        const { affected } = await db.getRepository(QuickbooksSession).update(
            {
                companyId,
            },
            { accessExpiryTimestamp: now.subtract(1, "day").toDate() }
        );

        expect(affected).toBe(1);

        await service.updateUnprocessedInvoices({ userId: user.id });
        expect(refreshSpy).toBeCalledTimes(1);
    });

    it("it should destory the session if it receives revoked", async () => {
        const { user, companyId } = await setupData(app, service);

        const session = await db.getRepository(QuickbooksSession).findOneBy({ companyId });
        expect(session).not.toBeNull();

        spyOn(client, "query").mockImplementation(async () => {
            return {
                _id: "revoked",
            } as const;
        });

        expect(async () => await service.updateUnprocessedInvoices({ userId: user.id })).toThrow(
            "Quickbooks session deleted"
        );

        const sessionAfter = await db.getRepository(QuickbooksSession).findOneBy({ companyId });
        expect(sessionAfter).toBeNull();
    });
});
