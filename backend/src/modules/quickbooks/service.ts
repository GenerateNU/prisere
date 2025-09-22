import dayjs from "dayjs";
import { QuickbooksClient } from "../../external/quickbooks/client";
import { withServiceErrorHandling } from "../../utilities/error";
import { IQuickbooksTransaction } from "./transaction";
import { QuickbooksSession } from "../../entities/QuickbookSession";

export interface IQuickbooksService {
    generateAuthUrl(args: { userId: string }): Promise<string>;
    createQuickbooksSession(args: { code: string; state: string; realmId: string }): Promise<QuickbooksSession>;
    refreshQuickbooksSession(args: { refreshToken: string; companyId: string }): Promise<QuickbooksSession>;
}

export class QuickbooksService implements IQuickbooksService {
    constructor(
        private transaction: IQuickbooksTransaction,
        private qbClient: QuickbooksClient
    ) {}

    generateAuthUrl = withServiceErrorHandling(async ({ userId }: { userId: string }) => {
        const { state, url } = this.qbClient.generateUrl({ scopes: ["accounting"] });

        await this.transaction.storeOAuth({ stateId: state, initiatorId: userId });

        return url;
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
                // TODO: error
                throw new Error();
            }

            const { access_token, expires_in, x_refresh_token_expires_in, refresh_token } =
                await this.qbClient.generateToken({
                    code,
                });

            const external = await this.transaction.getCompanyByRealm({ realmId });

            let companyId = external?.companyId;

            if (!external) {
                console.log({ companyId: maybeToken.initiatorUser?.companyId });
                if (!maybeToken.initiatorUser.companyId) {
                    // TODO: better errror
                    throw new Error("no company");
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
}
