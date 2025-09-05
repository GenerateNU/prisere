import { DataSource } from "typeorm";
import { Hono } from "hono";
import { IUserTransaction, UserTransaction } from "./transaction";
import { IUserService, UserService } from "./service";
import { IUserController, UserController } from "./controller";
export const userRoutes = (db: DataSource): Hono => {
    const user = new Hono();
  
    const userTransaction: IUserTransaction = new UserTransaction(db);
    const userService: IUserService = new UserService(userTransaction);
    const userController: IUserController = new UserController(userService);
  
    user.post("/", (ctx) => userController.createUser(ctx));
    return user;
};