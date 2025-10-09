import type { paths, components } from "../schema";

export type CreateUserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];
export type CreateUserResponse = paths["/users"]["post"]["requestBody"]["content"]["application/json"];
