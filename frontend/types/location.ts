import type { paths } from "../schema";

export type CreateLocationRequest = paths["/location-address"]["post"]["requestBody"]["content"]["application/json"];
export type CreateLocationResponse = paths["/location-address"]["post"]["responses"];

export type CreateLocationBulkRequest =
    paths["/location-address/bulk"]["post"]["requestBody"]["content"]["application/json"];

export type UpdateLocationRequest = paths["/location-address"]["patch"]["requestBody"]["content"]["application/json"];
export type UpdateLocationResponse = paths["/location-address"]["patch"]["responses"][200]["content"]["application/json"];
export type UpdateLocationBulkRequest =
    paths["/location-address/bulk"]["patch"]["requestBody"]["content"]["application/json"];
export type UpdateLocationBulkResponse = paths["/location-address/bulk"]["patch"]["responses"][200]["content"]["application/json"];

export type Location = paths["/location-address"]["post"]["responses"][201]["content"]["application/json"];
