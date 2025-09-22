import { Context, TypedResponse } from "hono";
import { IQuickbooksService } from "./service";

export interface IQuickbooksController {
    redirectToAuthorization(ctx: Context): Promise<TypedResponse<undefined, 302>>;
    generateSession(
        ctx: Context
    ): Promise<TypedResponse<{ success: true }, 200> | TypedResponse<{ error: string }, 400>>;
}

// TODO: test disconnect flow. opens about:blank tab on disconnect from browser interface?

export class QuickbooksController implements IQuickbooksController {
    constructor(private service: IQuickbooksService) {}

    async redirectToAuthorization(ctx: Context) {
        // TODO: how are we doing auth right now
        // const url = await this.service.generateAuthUrl({ userId: "" });
        const url = await this.service.generateAuthUrl({ userId: "086c8b52-69bc-411c-8346-30857fd2138d" });

        return ctx.redirect(url);
    }

    async generateSession(ctx: Context) {
        // TODO: what to do when "no" selected on permissions?

        const code = ctx.req.query("code");
        const state = ctx.req.query("state");
        const realmId = ctx.req.query("realmId");

        if (!code) {
            return ctx.json({ error: "missing code query param" }, 400);
        }

        if (!state) {
            return ctx.json({ error: "missing state query param" }, 400);
        }

        if (!realmId) {
            return ctx.json({ error: "missing realm id" }, 400);
        }

        const _session = await this.service.createQuickbooksSession({
            code,
            state,
            realmId,
        });

        return ctx.json({ success: true }, 200);
    }
}
