import type { paths, components } from "../schema";

export type UserRequest = paths["/users"]["post"]["requestBody"]["content"]["application/json"];
export type UserResponse = paths["/users"]["post"]["requestBody"]["content"]["application/json"];
