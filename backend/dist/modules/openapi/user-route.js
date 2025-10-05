import { createRoute } from "@hono/zod-openapi";
import { CreateUserDTOSchema, GetUserComapnyDTOSchema, GetUserDTOSchema, CreateUserResponseSchema, GetUserResponseSchema, GetUserCompanyResponseSchema, } from "../../types/User";
import { UserController } from "../user/controller";
import { UserService } from "../user/service";
import { UserTransaction } from "../user/transaction";
import { openApiErrorCodes } from "../../utilities/error";
export const addOpenApiUserRoutes = (openApi, db) => {
    const userTransaction = new UserTransaction(db);
    const userService = new UserService(userTransaction);
    const userController = new UserController(userService);
    openApi.openapi(createUserRoute, (ctx) => userController.createUser(ctx));
    //openApi.openapi(_getUserCompanyRoute, (ctx) => userController.getCompany(ctx));
    //openApi.openapi(_getUserRoute, (ctx) => userController.getUser(ctx));
    return openApi;
};
const createUserRoute = createRoute({
    method: "post",
    path: "/users",
    summary: "Create a new user",
    description: "Creates a new user with the provided information",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateUserDTOSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateUserResponseSchema,
                },
            },
            description: "Create user response",
        },
        ...openApiErrorCodes("Create user error"),
    },
    tags: ["Users"],
});
const _getUserRoute = createRoute({
    method: "get",
    path: "/users/:id",
    summary: "Fetches a user by the given ID",
    description: "Finds the user with the given ID in the database",
    request: {
        params: GetUserDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetUserResponseSchema,
                },
            },
            description: "Successfull fetch of a user from the databse",
        },
        404: {
            description: "There does not exist any user in the database such that the given id matches their id",
        },
        ...openApiErrorCodes("Get User Error"),
    },
    tags: ["Users"],
});
const _getUserCompanyRoute = createRoute({
    method: "get",
    path: "/users/:id/company",
    summary: "Fetches a user's associated company by the given user ID",
    description: "Finds the user's comapny with the given user's ID in the database",
    request: {
        params: GetUserComapnyDTOSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: GetUserCompanyResponseSchema,
                },
            },
            description: "Successfull fetch of a user's company from the database",
        },
        404: {
            description: "There does not exist any user in the database such that the given id matches their id OR there is no such user with the given ID that has a non-null company",
        },
        ...openApiErrorCodes("Get Company from User"),
    },
    tags: ["Users"],
});
