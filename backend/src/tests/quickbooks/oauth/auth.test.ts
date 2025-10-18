import { beforeAll, describe, expect, it } from "bun:test";
import { QuickbooksService } from "../../../modules/quickbooks/service";
import { QuickbooksTransaction } from "../../../modules/quickbooks/transaction";
import { Hono } from "hono";
import { startTestApp } from "../../setup-tests";
import { DataSource } from "typeorm";
import { MockQBClient, setupData } from "./mock-client";
import { createUserWithCompany } from "../../utils";
import { QuickbooksPendingOAuth } from "../../../entities/QuickbooksPendingOAuth";
import { IBackup } from "pg-mem";
import { afterEach } from "node:test";
import { QuickbooksSession } from "../../../entities/QuickbookSession";
import { CompanyExternal } from "../../../entities/CompanyExternals";
import { UserTransaction } from "../../../modules/user/transaction";
import { randomUUID } from "crypto";

describe("creating oauth connection", () => {
    let app: Hono;
    let db: DataSource;
    let backup: IBackup;

    let service: QuickbooksService;

    beforeAll(async () => {
        ({ app, backup, dataSource: db } = await startTestApp());

        const transaction = new QuickbooksTransaction(db);
        const userTransaction = new UserTransaction(db);
        const mockClient = new MockQBClient();
        service = new QuickbooksService(transaction, userTransaction, mockClient);
    });

    afterEach(() => {
        backup.restore();
    });

    it("create a pending session in the db on start of auth", async () => {
        const user = (await createUserWithCompany(app, { id: randomUUID(), firstName: "test", lastName: "user" })).data;

        const { state } = await service.generateAuthUrl({ userId: user.id });

        const pendingOAuths = await db.getRepository(QuickbooksPendingOAuth).findBy({
            initiatorUserId: user.id,
        });

        expect(pendingOAuths).toBeArrayOfSize(1);

        expect(pendingOAuths[0].stateId).toBe(state);
        expect(pendingOAuths[0].consumedAt).toBeNull();
    });

    it("it should expire pending oauth on approval", async () => {
        const { user, state, companyId } = await setupData(app, service);

        expect(user.companyId).toBe(companyId);

        const pendingOAuths = await db.getRepository(QuickbooksPendingOAuth).findBy({
            initiatorUserId: user.id,
        });

        expect(pendingOAuths).toBeArrayOfSize(1);

        expect(pendingOAuths[0].stateId).toBe(state);
        expect(pendingOAuths[0].consumedAt).not.toBeNull();
    });

    it("it should reject requests with mismatched state ids", async () => {
        const user = (await createUserWithCompany(app, { id: randomUUID(), firstName: "test", lastName: "user" })).data;

        await service.generateAuthUrl({ userId: user.id });

        expect(() =>
            service.createQuickbooksSession({ code: "", state: "mismatching-state", realmId: "testing-realm" })
        ).toThrow("State mismatch");
    });

    it("should create valid quickbooks session", async () => {
        const { companyId } = await setupData(app, service);

        const sessions = await db.getRepository(QuickbooksSession).findBy({
            companyId,
        });

        expect(sessions).toBeArrayOfSize(1);
        expect(sessions[0].accessToken).toBe(MockQBClient.mockAccessToken);
        expect(sessions[0].refreshToken).toBe(MockQBClient.mockRefreshToken);
    });
});

describe("integration with company", () => {
    let app: Hono;
    let db: DataSource;
    let backup: IBackup;

    let service: QuickbooksService;

    beforeAll(async () => {
        ({ app, backup, dataSource: db } = await startTestApp());

        const transaction = new QuickbooksTransaction(db);
        const userTransaction = new UserTransaction(db);
        const mockClient = new MockQBClient();
        service = new QuickbooksService(transaction, userTransaction, mockClient);
    });

    afterEach(() => {
        backup.restore();
    });

    it("should create company external", async () => {
        const { companyId } = await setupData(app, service);

        const externals = await db.getRepository(CompanyExternal).findBy({
            companyId,
            source: "quickbooks",
        });

        expect(externals).toBeArrayOfSize(1);
    });
});
