import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
    CreateUserAPIResponseSchema,
    CreateUserDTOSchema,
    GetUserAPIResponseSchema,
    GetUserComapnyAPIResponseSchema as GetUserCompanyAPIResponseSchema,
    GetUserComapnyDTOSchema,
    GetUserDTOSchema,
} from "../user/types";
import { IUserController, UserController } from "../user/controller";
import { IUserService, UserService } from "../user/service";
import { IUserTransaction, UserTransaction } from "../user/transaction";

export const addOpenApiUserRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const userTransaction: IUserTransaction = new UserTransaction(db);
    const userService: IUserService = new UserService(userTransaction);
    const userController: IUserController = new UserController(userService);

    openApi.openapi(createUserRoute, (ctx) => userController.createUser(ctx));
    //openApi.openapi(getUserCompanyRoute, (ctx) => userController.getCompany(ctx));
    //openApi.openapi(getUserRoute, (ctx) => userController.getUser(ctx));
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
                    schema: GetUserAPIResponseSchema,
                },
            },
            description: "Successfull fetch of a user from the databse",
        },
        400: {
            description: "The given id is not a well formed UUID",
        },
        404: {
            description: "There does not exist any user in the database such that the given id matches their id",
        },
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
                    schema: GetUserCompanyAPIResponseSchema,
                },
            },
            description: "Successfull fetch of a user's company from the database",
        },
        400: {
            description: "The given id is not a well formed UUID",
        },
        404: {
            description:
                "There does not exist any user in the database such that the given id matches their id OR there is no such user with the given ID that has a non-null company",
        },
    },

    tags: ["Users"],
});
