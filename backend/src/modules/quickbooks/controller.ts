import { Context, TypedResponse } from "hono";
import { IQuickbooksService } from "./service";
import { RedirectEndpointParams } from "../../types/quickbooks";
import { ControllerResponse } from "../../utilities/response";
import Boom from "@hapi/boom";
import { validate } from "uuid";

export interface IQuickbooksController {
    redirectToAuthorization(ctx: Context): ControllerResponse<TypedResponse<{ url: string }, 200>>;
    generateSession(ctx: Context): Promise<Response>;
    updateUnprocessedInvoices(ctx: Context): ControllerResponse<TypedResponse<{ success: true }, 200>>;
    importQuickbooksData(ctx: Context): ControllerResponse<TypedResponse<{ success: true }, 201>>;
}

export class QuickbooksController implements IQuickbooksController {
    constructor(private service: IQuickbooksService) {}

    async redirectToAuthorization(ctx: Context) {
        const userId = ctx.get("userId");

        const { url } = await this.service.generateAuthUrl({ userId });

        return ctx.json({ url }, 200);
    }

    async generateSession(ctx: Context) {
        const params = RedirectEndpointParams.parse(ctx.req.query());

        if ("error" in params) {
            await this.service.consumeOAuthState({ state: params.state });

            return ctx.json({ error: "Did not approve" }, 400);
        }

        await this.service.createQuickbooksSession(params);

        return ctx.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}`);
    }

    async updateUnprocessedInvoices(ctx: Context) {
        const userId = ctx.get("userId");
        await this.service.updateUnprocessedInvoices({ userId });

        return ctx.json({ success: true }, 200);
    }

    async importQuickbooksData(ctx: Context) {
        const userId = ctx.get("userId");
        if (!userId || typeof userId !== "string" || userId.trim() === "" || !validate(userId)) {
            throw Boom.badRequest("Invalid or missing userId");
        }
        await this.service.importQuickbooksData({ userId });
        return ctx.json({ success: true }, 201);
    }
}
