import { DataSource, IsNull } from "typeorm";
import { CompanyExternal, CompanyExternalSource } from "../../entities/CompanyExternals";
import { QuickbooksSession } from "../../entities/QuickbookSession";
import { QuickbooksPendingOAuth } from "../../entities/QuickbooksPendingOAuth";

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
                ["companyId"],
                {
                    skipUpdateIfNoValuesChanged: true,
                }
            )
            .printSql()
            .returning("*")
            .execute();

        return res.raw[0] as QuickbooksSession;
    }
}
