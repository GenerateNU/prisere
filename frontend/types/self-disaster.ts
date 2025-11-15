import type { paths } from "../schema";

export type CreateSelfDisasterRequest = NonNullable<
    paths["/disaster/self"]["post"]["requestBody"]
>["content"]["application/json"];
export type CreateSelfDisasterResponse =
    paths["/disaster/self"]["post"]["responses"][201]["content"]["application/json"];

export type UpdateSelfDisasterRequest = NonNullable<
    paths["/disaster/self/{id}"]["patch"]["requestBody"]
>["content"]["application/json"];
export type UpdateSelfDisasterResponse =
    paths["/disaster/self/{id}"]["patch"]["responses"][200]["content"]["application/json"];
