import { Context, TypedResponse } from "hono";
import { IQuickbooksService } from "./service";
import { RedirectEndpointParams } from "../../types/quickbooks";
import { ControllerResponse } from "../../utilities/response";

export interface IQuickbooksController {
    redirectToAuthorization(ctx: Context): ControllerResponse<TypedResponse<undefined, 302>>;
    generateSession(
        ctx: Context
    ): ControllerResponse<TypedResponse<{ success: true }, 200> | TypedResponse<{ error: string }, 400>>;
    updateUnprocessedInvoices(ctx: Context): ControllerResponse<TypedResponse<{ success: true }, 200>>;
}

export class QuickbooksController implements IQuickbooksController {
    constructor(private service: IQuickbooksService) {}

    async redirectToAuthorization(ctx: Context) {
        const userId = ctx.get("userId");

        const { url } = await this.service.generateAuthUrl({ userId });

        return ctx.redirect(url);
    }

    async generateSession(ctx: Context) {
        const params = RedirectEndpointParams.parse(ctx.req.query());

        if ("error" in params) {
            await this.service.consumeOAuthState({ state: params.state });

            return ctx.json({ error: "Did not approve" }, 400);
        }

        await this.service.createQuickbooksSession(params);

        return ctx.json({ success: true }, 200);
    }

    async updateUnprocessedInvoices(ctx: Context) {
        const userId = ctx.get("userId");
        await this.service.updateUnprocessedInvoices({ userId });

        return ctx.json({ success: true }, 200);
    }
}
