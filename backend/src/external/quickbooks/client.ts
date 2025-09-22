import Csrf from "csrf";
import { btoa } from "buffer";
import { fetch } from "bun";

export class QuickbooksClient {
    private static readonly SCOPES = {
        accounting: "com.intuit.quickbooks.accounting",
        payment: "com.intuit.quickbooks.payment",
        payroll: "com.intuit.quickbooks.payroll",
        timeTracking: "com.intuit.quickbooks.payroll.timetracking",
        benefits: "com.intuit.quickbooks.payroll.benefits",
        profile: "profile",
        email: "email",
        phone: "phone",
        address: "address",
        openId: "openid",
        intuitName: "intuit_name",
    };

    // generate authorization for getting token
    private static readonly authorizationEndpoint = "https://appcenter.intuit.com/connect/oauth2";

    // generate/refresh access tokens
    private static readonly tokenEndpoint = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

    // sandbox
    // https://developer.api.intuit.com/.well-known/openid_sandbox_configuration

    // prod
    // https://developer.api.intuit.com/.well-known/openid_configuration

    private state = new Csrf();
    private clientId: string;
    private clientSecret: string;
    private enviornment: "sandbox" | "production";
    private redirectUri: string;

    private authHeaderToken: string;

    constructor({
        clientId,
        clientSecret,
        enviornment,
        redirectUri,
    }: {
        clientId: string;
        clientSecret: string;
        enviornment: "sandbox" | "production";
        redirectUri: string;
    }) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.enviornment = enviornment;
        this.redirectUri = redirectUri;

        this.authHeaderToken = btoa(`${this.clientId}:${this.clientSecret}`);
    }

    public generateUrl({ scopes }: { scopes: (keyof typeof QuickbooksClient.SCOPES)[] }) {
        const scopeValues = scopes.map((s) => QuickbooksClient.SCOPES[s]);

        const state = this.state.create(this.state.secretSync());

        const params = new URLSearchParams({
            response_type: "code",
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            scope: scopeValues.join(" "),
            state,
        });

        const url = `${QuickbooksClient.authorizationEndpoint}?${params.toString()}`;
        console.log("auth url", url);

        return { url, state };
    }

    public async generateToken({ code }: { code: string }) {
        const response = await fetch(QuickbooksClient.tokenEndpoint, {
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
        }).then((res) => res.json() as unknown as OauthTokenResponse);

        return response;
    }

    public async refreshToken({ refreshToken }: { refreshToken: string }) {
        const response = await fetch(QuickbooksClient.tokenEndpoint, {
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
        }).then((res) => res.json() as unknown as OauthTokenResponse);

        return response;
    }

    // TODO: when making requests, always update the refresh_token to the latest thing returned by the server
    // https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/faq
}

type OauthTokenResponse = {
    expires_in: number;
    x_refresh_token_expires_in: number;
    refresh_token: string;
    access_token: string;
    token_type: "bearer";
};
