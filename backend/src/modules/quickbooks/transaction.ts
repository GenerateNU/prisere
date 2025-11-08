import { DataSource, IsNull } from "typeorm";
import { CompanyExternal, CompanyExternalSource } from "../../entities/CompanyExternals";
import { QuickbooksSession } from "../../entities/QuickbookSession";
import { QuickbooksPendingOAuth } from "../../entities/QuickbooksPendingOAuth";
import { Company } from "../../entities/Company";

export interface IQuickbooksTransaction {
    storeOAuth(args: { stateId: string; initiatorId: string }): Promise<QuickbooksPendingOAuth>;
    fetchOAuth(args: { stateId: string }): Promise<QuickbooksPendingOAuth | null>;
    clearPendingOAuth(args: { stateId: string }): Promise<void>;
    getCompanyByRealm(args: { realmId: string }): Promise<CompanyExternal | null>;
    createCompanyRealm(args: { companyId: string; realmId: string }): Promise<void>;
    upsertQuickbooksSession(args: {
        accessToken: string;
        refreshToken: string;
        accessExpiryTimestamp: Date;
        refreshExpiryTimestamp: Date;
        companyId: string;
    }): Promise<QuickbooksSession>;
    getSessionForUser(args: {
        userId: string;
    }): Promise<{ session: QuickbooksSession | null; externalId: string | undefined }>;
    destroyQuickbooksSession(args: { externalId: string }): Promise<void>;
    updateCompanyInvoiceQuickbooksSync(args: { date: Date; companyId: string }): Promise<void>;
    updateCompanyPurchaseQuickbooksSync(args: { date: Date; companyId: string }): Promise<void>;
}

export class QuickbooksTransaction implements IQuickbooksTransaction {
    constructor(private db: DataSource) {}

    async storeOAuth({ stateId, initiatorId }: { stateId: string; initiatorId: string }) {
        const res = await this.db
            .createQueryBuilder()
            .insert()
            .into(QuickbooksPendingOAuth)
            .values({
                stateId,
                initiatorUserId: initiatorId,
                consumedAt: null,
            })
            .returning("*")
            .execute();

        return res.raw[0] as QuickbooksPendingOAuth;
    }

    async fetchOAuth({ stateId }: { stateId: string; initiatorId: string }) {
        const maybeToken = await this.db.getRepository(QuickbooksPendingOAuth).findOne({
            where: {
                consumedAt: IsNull(),
                stateId,
            },
            relations: {
                initiatorUser: {
                    company: true,
                },
            },
        });

        return maybeToken;
    }

    async clearPendingOAuth({ stateId }: { stateId: string }): Promise<void> {
        await this.db.getRepository(QuickbooksPendingOAuth).update({ stateId }, { consumedAt: new Date() });
    }

    async getCompanyByRealm({ realmId }: { realmId: string }) {
        const quickbooksExternal = await this.db
            .createQueryBuilder()
            .select("company_external")
            // .innerJoin() // TODO: join company table
            .from(CompanyExternal, "company_external")
            .where("company_external.source = :source", { source: "quickbooks" satisfies CompanyExternalSource })
            .andWhere("company_external.externalId = :id", { id: realmId })
            .getOne();

        return quickbooksExternal;
    }

    async createCompanyRealm({ companyId, realmId }: { companyId: string; realmId: string }) {
        await this.db.getRepository(CompanyExternal).insert({
            companyId,
            externalId: realmId,
            source: "quickbooks",
        });
    }

    async upsertQuickbooksSession({
        accessToken,
        refreshToken,
        accessExpiryTimestamp,
        refreshExpiryTimestamp,
        companyId,
    }: {
        accessToken: string;
        refreshToken: string;
        accessExpiryTimestamp: Date;
        refreshExpiryTimestamp: Date;
        companyId: string;
    }) {
        const res = await this.db
            .createQueryBuilder()
            .insert()
            .into(QuickbooksSession)
            .values({
                accessToken,
                refreshToken,
                accessExpiryTimestamp,
                refreshExpiryTimestamp,
                companyId,
            })
            .orUpdate(
                ["accessToken", "refreshToken", "accessExpiryTimestamp", "refreshExpiryTimestamp"],
                ["companyId"]
                // for now we are omitting this since pg-mem cannot support these types of queries
                // {
                //     skipUpdateIfNoValuesChanged: true,
                // }
            )
            .returning("*")
            .execute();

        return res.raw[0] as QuickbooksSession;
    }

    async getSessionForUser({ userId }: { userId: string }) {
        console.log(`Getting session for user: ${userId}`)
        const session = await this.db
            .getRepository(QuickbooksSession)
            .createQueryBuilder("qs")
            .innerJoinAndSelect("qs.company", "c")
            .innerJoinAndSelect("c.externals", "e", "e.source = :source", {
                source: "quickbooks" satisfies CompanyExternalSource,
            })
            .innerJoin("c.user", "u")
            .where("u.id = :userId", { userId })
            .getOne();

        return { session, externalId: session?.company?.externals[0]?.externalId };
    }

    async destroyQuickbooksSession({ externalId }: { externalId: string }) {
        const external = await this.db.getRepository(CompanyExternal).findOneBy({
            externalId,
            source: "quickbooks",
        });

        if (!external) {
            return;
        }

        const session = await this.db.getRepository(QuickbooksSession).findOneBy({
            companyId: external.companyId,
        });

        await Promise.allSettled([
            this.db.getRepository(CompanyExternal).delete({
                id: external.id,
            }),
            this.db.getRepository(QuickbooksSession).delete({
                accessToken: session?.accessToken,
                companyId: external?.companyId,
            }),
        ]);
    }

    async updateCompanyInvoiceQuickbooksSync({ date, companyId }: { date: Date; companyId: string }) {
        await this.db.getRepository(Company).update({ id: companyId }, { lastQuickBooksInvoiceImportTime: date });
    }

    async updateCompanyPurchaseQuickbooksSync({ date, companyId }: { date: Date; companyId: string }) {
        await this.db.getRepository(Company).update({ id: companyId }, { lastQuickBooksPurchaseImportTime: date });
    }
}
