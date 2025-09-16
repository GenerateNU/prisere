import { Context, TypedResponse } from "hono";
import { IUserService } from "./service";
import { CreateUserAPIResponse, CreateUserDTOSchema } from "../../types/User";
import { withControllerErrorHandling } from "../../utilities/error";

export interface IUserController {
    createUser(_ctx: Context): Promise<TypedResponse<CreateUserAPIResponse> | Response>;
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
}
