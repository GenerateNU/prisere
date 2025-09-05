import { Context, TypedResponse } from "hono";
import { IUserService } from "./service";
import { CreateUserDTO, CreateUserAPIResponse } from "../../types/User";
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { handleAppError } from "../../utilities/error";


export interface IUserController {
  createUser(ctx: Context): Promise<TypedResponse<CreateUserAPIResponse>>;
}

export class UserController {
    private userService: IUserService;
    
    constructor(service: IUserService) {
        this.userService = service;
    }

    async createUser(ctx: Context): Promise<TypedResponse<CreateUserAPIResponse>  > {
        const response = async () => {
            const json = await ctx.req.json();
            const payload = plainToInstance(CreateUserDTO, json);
            await validateOrReject(payload)

            const user = await this.userService.createUser(payload);
            return ctx.json(user, 200);
        }
        return await handleAppError(response)(ctx);
    }
}