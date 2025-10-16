import type { paths } from "../schema";

export type CreateLocationRequest = paths["/location-address"]["post"]["requestBody"]["content"]["application/json"];
export type CreateLocationResponse = paths["/location-address"]["post"]["responses"];

export type Location = paths["/location-address"]["post"]["responses"][201]["content"]["application/json"]
