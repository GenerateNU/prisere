import { withControllerErrorHandling } from "../../utilities/error";
import { CreateUserDTOSchema } from "../../types/User";
import { validate } from "uuid";
export class UserController {
    userService;
    constructor(service) {
        this.userService = service;
    }
    createUser = withControllerErrorHandling(async (ctx) => {
        const json = await ctx.req.json();
        const payload = CreateUserDTOSchema.parse(json);
        const user = await this.userService.createUser(payload);
        return ctx.json(user, 201);
    });
    getUser = withControllerErrorHandling(async (ctx) => {
        const maybeId = await ctx.req.param("id");
        if (!validate(maybeId)) {
            return ctx.json({ error: "The given ID must be well formed and present to get a User." }, 400);
        }
        const user = await this.userService.getUser({ id: maybeId });
        return ctx.json(user, 200);
    });
    getCompany = withControllerErrorHandling(async (ctx) => {
        const maybeId = await ctx.req.param("id");
        if (!validate(maybeId)) {
            return ctx.json({ error: "The given ID must be well formed and present to get the company of a user." }, 400);
        }
        const company = await this.userService.getCompany({ id: maybeId });
        return ctx.json(company, 200);
    });
}
