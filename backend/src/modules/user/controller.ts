import { Context, TypedResponse } from "hono";
import { IUserService } from "./service";
import { CreateUserDTOSchema, CreateUserResponse } from "../../types/User";
import { withControllerErrorHandling } from "../../utilities/error";
import { ControllerResponse } from "../../utilities/response";

export interface IUserController {
    createUser(_ctx: Context): ControllerResponse<TypedResponse<CreateUserResponse, 201>>;
}

export class UserController implements IUserController {
    private userService: IUserService;

    constructor(service: IUserService) {
        this.userService = service;
    }

    createUser = withControllerErrorHandling(async (ctx: Context) => {
        const json = await ctx.req.json();
        const payload = CreateUserDTOSchema.parse(json);
        const user = await this.userService.createUser(payload);
        return ctx.json(user, 201);
    });
}
