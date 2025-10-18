import dayjs from "dayjs";
import { IQuickbooksClient } from "../../external/quickbooks/client";
import { withServiceErrorHandling } from "../../utilities/error";
import { IQuickbooksTransaction } from "./transaction";
import { QuickbooksSession } from "../../entities/QuickbookSession";
import Boom from "@hapi/boom";
import { QBQueryResponse } from "../../external/quickbooks/types";
import { QBInvoice } from "../../types/quickbooks";
import { IUserTransaction } from "../user/transaction";

export interface IQuickbooksService {
    generateAuthUrl(args: { userId: string }): Promise<{ state: string; url: string }>;
    createQuickbooksSession(args: { code: string; state: string; realmId: string }): Promise<QuickbooksSession>;
    refreshQuickbooksSession(args: { refreshToken: string; companyId: string }): Promise<QuickbooksSession>;
    consumeOAuthState(args: { state: string }): Promise<void>;
    getUnprocessedInvoices(args: { userId: string }): Promise<QBInvoice[]>;
}

export class QuickbooksService implements IQuickbooksService {
    constructor(
        private transaction: IQuickbooksTransaction,
        private userTransaction: IUserTransaction,
        private qbClient: IQuickbooksClient
    ) {}

    generateAuthUrl = withServiceErrorHandling(async ({ userId }: { userId: string }) => {
        const { state, url } = this.qbClient.generateUrl({ scopes: ["accounting"] });

        await this.transaction.storeOAuth({ stateId: state, initiatorId: userId });

        return { state, url };
    });

    private async upsertQBSession({
        companyId,
        accessToken,
        refreshToken,
        accessExpiresIn,
        refreshExpiresIn,
    }: {
        companyId: string;
        accessToken: string;
        refreshToken: string;
        accessExpiresIn: number;
        refreshExpiresIn: number;
    }) {
        const accessExpiryTime = dayjs().add(accessExpiresIn, "seconds");
        const refreshExpiryTime = dayjs().add(refreshExpiresIn, "seconds");

        const session = await this.transaction.upsertQuickbooksSession({
            accessToken,
            refreshToken,
            accessExpiryTimestamp: accessExpiryTime.toDate(),
            refreshExpiryTimestamp: refreshExpiryTime.toDate(),
            companyId,
        });

        return session;
    }

    createQuickbooksSession = withServiceErrorHandling(
        async ({ code, state, realmId }: { code: string; state: string; realmId: string }) => {
            const maybeToken = await this.transaction.fetchOAuth({ stateId: state });

            if (maybeToken?.stateId !== state) {
                throw Boom.internal("State mismatch");
            }

            const { access_token, expires_in, x_refresh_token_expires_in, refresh_token } =
                await this.qbClient.generateToken({
                    code,
                });

            const external = await this.transaction.getCompanyByRealm({ realmId });

            let companyId = external?.companyId;

            if (!external) {
                if (!maybeToken.initiatorUser.companyId) {
                    throw Boom.badRequest("The requesting user deos not belong to a company");
                }

                await this.transaction.createCompanyRealm({
                    companyId: maybeToken.initiatorUser.companyId,
                    realmId,
                });
                companyId = maybeToken.initiatorUser.companyId;
            }

            await this.transaction.clearPendingOAuth({ stateId: state });

            const session = await this.upsertQBSession({
                accessToken: access_token,
                refreshToken: refresh_token,
                accessExpiresIn: expires_in,
                refreshExpiresIn: x_refresh_token_expires_in,
                companyId: companyId!, // see above, it must be not undefined
            });

            return session;
        }
    );

    refreshQuickbooksSession = withServiceErrorHandling(
        async ({ refreshToken, companyId }: { refreshToken: string; companyId: string }) => {
            const { access_token, expires_in, x_refresh_token_expires_in, refresh_token } =
                await this.qbClient.refreshToken({ refreshToken });

            return await this.upsertQBSession({
                accessToken: access_token,
                refreshToken: refresh_token,
                accessExpiresIn: expires_in,
                refreshExpiresIn: x_refresh_token_expires_in,
                companyId,
            });
        }
    );

    consumeOAuthState = withServiceErrorHandling(async ({ state }: { state: string }) => {
        await this.transaction.clearPendingOAuth({ stateId: state });
    });

    private async retryClientApi<T>(
        request: ClientRequest<T>,
        {
            existingSession,
            externalId,
            maxAttempts = 3,
        }: { existingSession: QuickbooksSession; externalId: string; maxAttempts?: number }
    ) {
        let tries = 0;
        let activeSession = existingSession;

        while (tries < maxAttempts) {
            tries++;
            const result = await request({ session: activeSession, externalId });

            if (result._id === "revoked") {
                await this.transaction.destroyQuickbooksSession({ externalId });

                throw Boom.unauthorized("Quickbooks session deleted");
            }

            if (result._id === "unauthorized") {
                activeSession = await this.refreshQuickbooksSession({
                    refreshToken: activeSession.refreshToken,
                    companyId: activeSession.companyId,
                });
                continue;
            }

            return result.data;
        }

        throw Boom.internal("Quickbooks could not be reached");
    }

    private async makeRequestToQB<T>({ userId, request }: { userId: string; request: ClientRequest<T> }) {
        const sessionInfo = await this.transaction.getSessionForUser({ userId });

        let session = sessionInfo.session;
        const externalId = sessionInfo.externalId;

        const now = dayjs();

        if (!session || !externalId || now.isSameOrAfter(session.refreshExpiryTimestamp)) {
            throw Boom.unauthorized("Quickbooks session is expired");
        }

        if (now.isSameOrAfter(session.accessExpiryTimestamp)) {
            session = await this.refreshQuickbooksSession({
                refreshToken: session.refreshToken,
                companyId: session.companyId,
            });
        }

        return await this.retryClientApi(request, { existingSession: session, externalId });
    }

    getUnprocessedInvoices = withServiceErrorHandling(async ({ userId }: { userId: string }) => {
        const user = await this.userTransaction.getCompany({ id: userId });
        if (!user) {
            throw Boom.internal("No user found");
        }
        const lastImport = user.company.lastQuickBooksImportTime;
        const lastImportDate = lastImport ? dayjs(lastImport) : null;

        const {
            QueryResponse: { Invoice: invoices },
        } = await this.makeRequestToQB({
            userId,
            request: (session) =>
                this.qbClient.query<{ Invoice: QBInvoice[] }>({
                    qbRealm: session.externalId,
                    accessToken: session.session.accessToken,
                    query: lastImportDate
                        ? `SELECT * FROM Invoice WHERE Metadata.LastUpdatedTime > '${lastImportDate.format("YYYY-MM-DDTHH:mm:ss")}'`
                        : `SELECT * FROM Invoice`,
                }),
        });

        await this.transaction.bulkUpsertInvoices(
            invoices.map((i) => ({
                companyId: user.company.id,
                qbDateCreated: new Date(i.MetaData.CreateTime),
                quickbooksId: parseInt(i.Id),
                totalAmountCents: i.TotalAmt * 100,
                lineItems: getLineItems(i).map((i) => ({
                    description: i.description,
                    qbLineItemId: i.id,
                    amountCents: i.amountCents,
                    category: i.category,
                })),
            }))
        );

        return invoices;
    });
}

type ClientRequest<T> = (input: { session: QuickbooksSession; externalId: string }) => Promise<QBQueryResponse<T>>;

function getLineItems(invoice: QBInvoice) {
    const out = [] as { id: number; amountCents: number; description: string; category: string }[];

    for (const lineItem of invoice.Line) {
        switch (lineItem.DetailType) {
            case "SalesLineItemDetail":
                out.push({
                    id: parseInt(lineItem.Id),
                    amountCents: lineItem.Amount * 100,
                    description: lineItem.Description ?? "",
                    category: "", // TODO: there is no category reported?
                });
                break;
            case "GroupLineDetail":
                out.push(
                    ...lineItem.GroupLineDetail.Line.map((l) => ({
                        id: parseInt(l.Id),
                        amountCents: l.Amount * 100,
                        description: l.Description ?? "",
                        category: "",
                    }))
                );
                break;
            case "DescriptionOnly":
            case "DiscountLineDetail":
            case "SubTotalLineDetail":
                break;
        }
    }

    return out;
}
