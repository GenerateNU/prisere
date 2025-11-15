import { Hono } from "hono";
import { DataSource } from "typeorm";
import { IUserController, UserController } from "./controller";
import { IUserService, UserService } from "./service";
import { IUserTransaction, UserTransaction } from "./transaction";

export const userRoutes = (db: DataSource): Hono => {
    const user = new Hono();

    const userTransaction: IUserTransaction = new UserTransaction(db);
    const userService: IUserService = new UserService(userTransaction);
    const userController: IUserController = new UserController(userService);

    user.post("/", (ctx) => userController.createUser(ctx));
    user.patch("/", (ctx) => userController.updateUser(ctx));
    user.get("/", (ctx) => userController.getUser(ctx));
    user.get("/company", (ctx) => userController.getCompany(ctx));
    return user;
};
