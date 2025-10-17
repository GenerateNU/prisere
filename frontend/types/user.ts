import type { paths } from "../schema";

export type CreateUserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];

export type CreateUserResponse = paths["/users"]["post"]["responses"];

export type User = paths["/users"]["post"]["responses"][201]["content"]["application/json"];

export type loginInitialState = {
    success: boolean;
    message: string;
};

export type signupInitialState = {
    success: boolean;
    message: string;
    email?: string;
};
