import { Context, TypedResponse } from "hono";
import { IQuickbooksService } from "./service";
import { RedirectEndpointParams } from "../../types/quickbooks";
import { ControllerResponse } from "../../utilities/response";
import Boom from "@hapi/boom";

export interface IQuickbooksController {
    redirectToAuthorization(ctx: Context): ControllerResponse<TypedResponse<undefined, 302>>;
    generateSession(
        ctx: Context
    ): ControllerResponse<TypedResponse<{ success: true }, 200> | TypedResponse<{ error: string }, 400>>;
    updateUnprocessedInvoices(ctx: Context): ControllerResponse<TypedResponse<{ success: true }, 200>>;
    importQuickbooksData(ctx: Context): ControllerResponse<TypedResponse<{ success: true }, 201>>;
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

    async importQuickbooksData(ctx: Context) {
        let userId = ctx.get("userId");
        userId = "422992d5-9ed6-4093-b52b-e076f5dd7aeb";
        console.log(`Got user ID ${userId} to import QK data from`);
        if (!userId || typeof userId !== "string" || userId.trim() === "") {
            throw Boom.badRequest("Invalid or missing userId");
        }
        console.log("About to import QB data");
        await this.service.importQuickbooksData({ userId });
        return ctx.json({ success: true }, 201);
    }
}
