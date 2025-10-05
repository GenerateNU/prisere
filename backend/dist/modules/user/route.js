import { Hono } from "hono";
import { UserTransaction } from "./transaction";
import { UserService } from "./service";
import { UserController } from "./controller";
export const userRoutes = (db) => {
    const user = new Hono();
    const userTransaction = new UserTransaction(db);
    const userService = new UserService(userTransaction);
    const userController = new UserController(userService);
    user.post("/", (ctx) => userController.createUser(ctx));
    user.get("/:id", (ctx) => userController.getUser(ctx));
    user.get("/:id/company", (ctx) => userController.getCompany(ctx));
    return user;
};
