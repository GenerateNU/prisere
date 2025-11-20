import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DataSource } from "typeorm";
import {
    CreateUpdateUserResponseSchema,
    createUserRequestBody,
    GetUserCompanyResponseSchema,
    GetUserResponseSchema,
    UpdateUserRequestBodySchema,
} from "../../types/User";
import { openApiErrorCodes } from "../../utilities/error";
import { IUserController, UserController } from "../user/controller";
import { IUserService, UserService } from "../user/service";
import { IUserTransaction, UserTransaction } from "../user/transaction";

export const addOpenApiUserRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const userTransaction: IUserTransaction = new UserTransaction(db);
    const userService: IUserService = new UserService(userTransaction);
    const userController: IUserController = new UserController(userService);

    openApi.openapi(createUserRoute, (ctx) => userController.createUser(ctx));
    openApi.openapi(getUserCompanyRoute, (ctx) => userController.getCompany(ctx));
    openApi.openapi(getUserRoute, (ctx) => userController.getUser(ctx));
    openApi.openapi(updateUserRoute, (ctx) => userController.updateUser(ctx));
    return openApi;
};

const createUserRoute = createRoute({
    method: "post",
    path: "/users",
    summary: "Create a new user",
    description: "Creates a new user with the provided information",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: createUserRequestBody,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateUpdateUserResponseSchema,
                },
            },
            description: "Create user response",
        },
        ...openApiErrorCodes("Create user error"),
    },
    tags: ["Users"],
});

const getUserRoute = createRoute({
    method: "get",
    path: "/users",
    summary: "Fetches a user by the given ID",
    description: "Finds the user with the given ID in the database",
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

const getUserCompanyRoute = createRoute({
    method: "get",
    path: "/users/company",
    summary: "Fetches a user's associated company by the given user ID",
    description: "Finds the user's company with the given user's ID in the database",
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
            description:
                "There does not exist any user in the database such that the given id matches their id OR there is no such user with the given ID that has a non-null company",
        },
        ...openApiErrorCodes("Get Company from User"),
    },

    tags: ["Users"],
});

const updateUserRoute = createRoute({
    method: "patch",
    path: "/users",
    summary: "Updates a user by the given ID",
    description: "Updates the user with the given ID in the database",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UpdateUserRequestBodySchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: CreateUpdateUserResponseSchema,
                },
            },
            description: "Successfully updated user",
        },
        ...openApiErrorCodes("Update user error"),
    },
    tags: ["Users"],
});
