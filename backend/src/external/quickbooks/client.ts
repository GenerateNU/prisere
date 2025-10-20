import Csrf from "csrf";
import { btoa } from "buffer";
import { fetch } from "bun";
import {
    QBAuthenticationErrorResponse,
    QBOAuthTokenResponse,
    QBQueryResponse,
    QBSuccessfulQueryResponse,
} from "./types";

const PROD_BASE_URL = "https://quickbooks.api.intuit.com";
const SANDBOX_BASE_URL = "https://sandbox-quickbooks.api.intuit.com";

export const QB_SCOPES = {
    accounting: "com.intuit.quickbooks.accounting",
    payment: "com.intuit.quickbooks.payment",
};

export interface IQuickbooksClient {
    generateUrl(args: { scopes: (keyof typeof QB_SCOPES)[] }): { url: string; state: string };
    generateToken(args: { code: string }): Promise<QBOAuthTokenResponse>;
    refreshToken(args: { refreshToken: string }): Promise<QBOAuthTokenResponse>;
    _exampleQueryData({
        qbRealm,
        accessToken,
    }: {
        /**
         * The QuickBooks realm is the externalId of the company's QuickBooks company.
         *
         * QuickBooks calls this a "realm", it's just an ID
         */
        qbRealm: string;
        accessToken: string;
    }): Promise<QBQueryResponse<unknown>>;
}

export class QuickbooksClient implements IQuickbooksClient {
    // generate authorization for getting token
    private static readonly AUTHORIZATION_ENDPOINT = "https://appcenter.intuit.com/connect/oauth2";

    // generate/refresh access tokens
    private static readonly TOKEN_ENDPOINT = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

    // sandbox
    // https://developer.api.intuit.com/.well-known/openid_sandbox_configuration

    // prod
    // https://developer.api.intuit.com/.well-known/openid_configuration

    private state = new Csrf();
    private clientId: string;
    private clientSecret: string;
    private environment: "sandbox" | "production";
    private redirectUri: string;

    private authHeaderToken: string;
    private BASE_URL: string;

    constructor({
        clientId,
        clientSecret,
        environment,
    }: {
        clientId: string;
        clientSecret: string;
        environment: "sandbox" | "production";
    }) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.environment = environment;

        this.authHeaderToken = btoa(`${this.clientId}:${this.clientSecret}`);
        this.BASE_URL = environment === "production" ? PROD_BASE_URL : SANDBOX_BASE_URL;
        this.redirectUri =
            environment === "production"
                ? // TODO: get a real redirect for prod
                  ""
                : // TODO: finalize if this is the real route we want to redirect to, I think we need a better frontend page or something,
                  // maybe we redirect from the server after going here?
                  "http://localhost:3001/quickbooks/redirect";
    }

    public generateUrl({ scopes }: { scopes: (keyof typeof QB_SCOPES)[] }) {
        const scopeValues = scopes.map((s) => QB_SCOPES[s]);

        const state = this.state.create(this.state.secretSync());

        const params = new URLSearchParams({
            response_type: "code",
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            scope: scopeValues.join(" "),
            state,
        });

        const url = `${QuickbooksClient.AUTHORIZATION_ENDPOINT}?${params.toString()}`;

        return { url, state };
    }

    public async generateToken({ code }: { code: string }) {
        const response = await fetch(QuickbooksClient.TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Basic ${this.authHeaderToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
                Host: "oauth.platform.intuit.com",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: this.redirectUri,
            }),
        }).then((res) => res.json() as unknown as QBOAuthTokenResponse);

        return response;
    }

    public async refreshToken({ refreshToken }: { refreshToken: string }) {
        const response = await fetch(QuickbooksClient.TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Basic ${this.authHeaderToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
                Host: "oauth.platform.intuit.com",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        }).then((res) => res.json() as unknown as QBOAuthTokenResponse);

        return response;
    }

    async _exampleQueryData({
        qbRealm,
        accessToken,
    }: {
        qbRealm: string;
        accessToken: string;
    }): Promise<QBQueryResponse<unknown>> {
        const params = new URLSearchParams({
            // [FUTURE]: This query string is changed out based on what we are requestign (sort of like SQL)
            // We might want to create a query builder or something down the road
            query: "select * from bill maxresults 2",
            minorVersion: "75",
        });

        const url = `${this.BASE_URL}/v3/company/${qbRealm}/query?${params}`;

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        }).then(async (res): Promise<QBQueryResponse<unknown>> => {
            if (res.status === 401) {
                const response = (await res.json()) as unknown as QBAuthenticationErrorResponse;

                if (response.fault.error[0].detail === "Token revoked") {
                    return { _id: "revoked" };
                }

                return { _id: "unauthorized" };
            }

            return { _id: "valid", data: (await res.json()) as any };
        });

        if (response._id === "valid") {
            return {
                _id: "valid",
                // [FUTURE]: once we start querying data, this can be cleaned up
                data: response.data as QBSuccessfulQueryResponse<unknown>["data"],
            };
        }

        return response;
    }
}
