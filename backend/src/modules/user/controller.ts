import { Context, TypedResponse } from "hono";
import { validate } from "uuid";
import {
    CreateUserDTOSchema,
    CreateUserResponse,
    GetUserCompanyResponse,
    GetUserResponse,
    UpdateUserRequestBodySchema,
    UpdateUserResponse,
} from "../../types/User";
import { withControllerErrorHandling } from "../../utilities/error";
import { ControllerResponse } from "../../utilities/response";
import { IUserService } from "./service";

export interface IUserController {
    createUser(_ctx: Context): ControllerResponse<TypedResponse<CreateUserResponse, 201>>;
    getUser(_ctx: Context): ControllerResponse<TypedResponse<GetUserResponse, 200>>;
    getCompany(_ctx: Context): ControllerResponse<TypedResponse<GetUserCompanyResponse, 200>>;
    updateUser(_ctx: Context): ControllerResponse<TypedResponse<UpdateUserResponse, 201>>;
}

export class UserController implements IUserController {
    private userService: IUserService;

    constructor(service: IUserService) {
        this.userService = service;
    }

    createUser = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<CreateUserResponse, 201>> => {
            console.log("CReate user was called")
            const json = await ctx.req.json();
            const userId = ctx.get("userId");
            const payload = CreateUserDTOSchema.parse({ ...json, id: userId });
            const user = await this.userService.createUser(payload);
            return ctx.json(user, 201);
        }
    );

    getUser = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetUserResponse, 200>> => {
            const maybeId = ctx.get("userId");

            if (!validate(maybeId)) {
                return ctx.json({ error: "The given ID must be well formed and present to get a User." }, 400);
            }

            const user = await this.userService.getUser({ id: maybeId });
            return ctx.json(user, 200);
        }
    );

    getCompany = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<GetUserCompanyResponse, 200>> => {
            const maybeId = ctx.get("userId");

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

    updateUser = withControllerErrorHandling(
        async (ctx: Context): ControllerResponse<TypedResponse<UpdateUserResponse, 201>> => {
            const maybeId = ctx.get("userId");
            const json = await ctx.req.json();

            const payload = UpdateUserRequestBodySchema.parse(json);
            const user = await this.userService.updateUser({ ...payload, id: maybeId });

            return ctx.json(user, 201);
        }
    );
}
