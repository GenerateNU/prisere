import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import {
    CreateUserResponseSchema,
    GetUserResponseSchema,
    GetUserCompanyResponseSchema,
    createUserRequestBody,
} from "../../types/User";
import { IUserController, UserController } from "../user/controller";
import { IUserService, UserService } from "../user/service";
import { IUserTransaction, UserTransaction } from "../user/transaction";
import { openApiErrorCodes } from "../../utilities/error";

export const addOpenApiUserRoutes = (openApi: OpenAPIHono, db: DataSource): OpenAPIHono => {
    const userTransaction: IUserTransaction = new UserTransaction(db);
    const userService: IUserService = new UserService(userTransaction);
    const userController: IUserController = new UserController(userService);

    openApi.openapi(createUserRoute, (ctx) => userController.createUser(ctx));
    openApi.openapi(getUserCompanyRoute, (ctx) => userController.getCompany(ctx));
    openApi.openapi(getUserRoute, (ctx) => userController.getUser(ctx));
    return openApi;
};

// we have to define this here (annoyingly) because the zod imports get messed up somehow
// specifically from User.ts and specifically this schema
// I can't figure out any more than that, so I give in.

// If you move the schemas from User.ts to anywhere else it works.
// If you use a different schema from Company.ts or something it also works.
const GetUserDTOSchemaLocal = z.object({
    id: z.string().nonempty(),
});

const GetUserComapnyDTOSchemaLocal = z.object({
    id: z.string().nonempty(),
});

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
                    schema: CreateUserResponseSchema,
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
