import { DataSource } from "typeorm";
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { CreateUserAPIResponseSchema, CreateUserDTOSchema } from "../../types/User";
import { UserController } from "../user/controller";
import { IUserService, UserService } from "../user/service";
import { IUserTransaction, UserTransaction } from "../user/transaction";

export const openApiRoutes = (db: DataSource): OpenAPIHono => {
    const openApi = new OpenAPIHono();
  
    const userTransaction: IUserTransaction = new UserTransaction(db);
    const userService: IUserService = new UserService(userTransaction);
    const userController: UserController = new UserController(userService);
  
    openApi.openapi(createUserRoute, (ctx) => userController.createUser(ctx));
    return openApi;
};

const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  summary: 'Create a new user',
  description: 'Creates a new user with the provided information',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserDTOSchema,
        },
      },
    },
  },
  responses: {
    201: {
        content: {
        'application/json': {
            schema: CreateUserAPIResponseSchema,
        },
        },
        description: 'Create user response',
    },
},
  tags: ['Users'],
});