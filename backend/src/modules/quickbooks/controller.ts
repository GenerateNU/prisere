import { Context, TypedResponse } from "hono";
import { IQuickbooksService } from "./service";
import { RedirectEndpointParams } from "../../types/quickbooks";
import { ControllerResponse } from "../../utilities/response";

export interface IQuickbooksController {
    redirectToAuthorization(ctx: Context): ControllerResponse<TypedResponse<undefined, 302>>;
    generateSession(
        ctx: Context
    ): ControllerResponse<TypedResponse<{ success: true }, 200> | TypedResponse<{ error: string }, 400>>;
    getUnprocessedInvoices(ctx: Context): ControllerResponse<TypedResponse<unknown, 200>>;
}

export class QuickbooksController implements IQuickbooksController {
    constructor(private service: IQuickbooksService) {}

    async redirectToAuthorization(ctx: Context) {
        // TODO: how are we doing auth? we need to get this userId in the Context I think
        const { url } = await this.service.generateAuthUrl({ userId: "086c8b52-69bc-411c-8346-30857fd2138d" });

        return ctx.redirect(url);
    }

    async generateSession(ctx: Context) {
        // TODO: what to do when "no" selected on permissions?
        const params = RedirectEndpointParams.parse(ctx.req.query());

        if ("error" in params) {
            await this.service.consumeOAuthState({ state: params.state });

            return ctx.json({ error: "Did not approve" }, 400);
        }

        const _session = await this.service.createQuickbooksSession(params);

        return ctx.json({ success: true }, 200);
    }

    async getUnprocessedInvoices(ctx: Context) {
        const data = await this.service.getUnprocessedInvoices({
            userId: "086c8b52-69bc-411c-8346-30857fd2138d",
        });

        return ctx.json(data, 200);
    }
}
