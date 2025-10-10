import { IQuickbooksClient, QB_SCOPES } from "../../../external/quickbooks/client";
import Csrf from "csrf";
import { createUserWithCompany } from "../../utils";
import { Hono } from "hono";
import { QuickbooksService } from "../../../modules/quickbooks/service";
import { randomUUID } from "crypto";

export class MockQBClient implements IQuickbooksClient {
    static readonly mockAccessToken = "mock-access-token";
    static readonly mockRefreshToken = "mock-refresh-token";

    private state = new Csrf();

    generateUrl(_args: { scopes: (keyof typeof QB_SCOPES)[] }) {
        const state = this.state.create(this.state.secretSync());
        return { url: "mock_url", state };
    }

    async generateToken(_args: { code: string }) {
        return {
            access_token: MockQBClient.mockAccessToken,
            expires_in: 3600,
            refresh_token: MockQBClient.mockRefreshToken,
            x_refresh_token_expires_in: 100000,
            token_type: "bearer",
        } as const;
    }

    async refreshToken(_args: { refreshToken: string }) {
        return {
            access_token: MockQBClient.mockAccessToken,
            expires_in: 3600,
            refresh_token: MockQBClient.mockRefreshToken,
            x_refresh_token_expires_in: 100000,
            token_type: "bearer",
        } as const;
    }

    async _exampleQueryData(_args: { qbRealm: string; accessToken: string }) {
        throw new Error("Attempted to perform unmocked query on QB client");

        // this is meant to be unreachable
        // eslint-disable-next-line no-unreachable
        return {} as any;
    }
}

export async function setupData(app: Hono, service: QuickbooksService) {
    const user = (await createUserWithCompany(app, { id: randomUUID(), firstName: "test", lastName: "user" })).data;

    const { state } = await service.generateAuthUrl({ userId: user.id });

    const { companyId } = await service.createQuickbooksSession({ code: "", state, realmId: "testing-realm" });

    return { user, state, companyId };
}
