import { DataSource } from "typeorm";
import { OpenAPIHono } from "@hono/zod-openapi";
import { IUserController, UserController } from "../user/controller";
import { IUserService, UserService } from "../user/service";
import { IUserTransaction, UserTransaction } from "../user/transaction";
import { createUserRoute, getUserCompanyRoute, getUserRoute } from "@prisere/types";

export const addOpenApiUserRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const userTransaction: IUserTransaction = new UserTransaction(db);
    const userService: IUserService = new UserService(userTransaction);
    const userController: IUserController = new UserController(userService);

    openApi.openapi(createUserRoute, (ctx) => userController.createUser(ctx));
    //openApi.openapi(getUserCompanyRoute, (ctx) => userController.getCompany(ctx));
    //openApi.openapi(getUserRoute, (ctx) => userController.getUser(ctx));
    return openApi;
};

