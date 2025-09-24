import { Context, TypedResponse } from "hono";
import { IUserService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import { GetUserAPIResponse, CreateUserAPIResponse, CreateUserDTOSchema, GetUserCompanyAPIResponse } from "./types";
import { validate } from "uuid";

export interface IUserController {
    createUser(_ctx: Context): Promise<TypedResponse<CreateUserAPIResponse> | Response>;
    getUser(_ctx: Context): Promise<TypedResponse<GetUserAPIResponse> | Response>;
    getCompany(_ctx: Context): Promise<TypedResponse<GetUserCompanyAPIResponse> | Response>;
}

export class UserController implements IUserController {
    private userService: IUserService;

    constructor(service: IUserService) {
        this.userService = service;
    }

    createUser = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<CreateUserAPIResponse>> => {
        const json = await ctx.req.json();
        const payload = CreateUserDTOSchema.parse(json);
        const user = await this.userService.createUser(payload);
        return ctx.json(user, 201);
    });

    getUser = withControllerErrorHandling(async (ctx: Context): Promise<TypedResponse<GetUserAPIResponse>> => {
        const maybeId = await ctx.req.param("id");

        if (!validate(maybeId)) {
            return ctx.json({ error: "The given ID must be well formed and present to get a User." }, 400);
        }

        const user = await this.userService.getUser({ id: maybeId });
        return ctx.json(user, 200);
    });

    getCompany = withControllerErrorHandling(
        async (ctx: Context): Promise<TypedResponse<GetUserCompanyAPIResponse>> => {
            const maybeId = await ctx.req.param("id");

            if (!validate(maybeId)) {
                return ctx.json(
                    { error: "The given ID must be well formed and present to get the company of a user." },
                    400
                );
            }

            const company = await this.userService.getCompany({ id: maybeId });
            return ctx.json(company, 200);
        }
    );
}
