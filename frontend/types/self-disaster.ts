import type { paths } from "../schema";

export type CreateSelfDisasterRequest = NonNullable<
    paths["/disaster/self"]["post"]["requestBody"]
>["content"]["application/json"];
export type CreateSelfDisasterResponse =
    paths["/disaster/self"]["post"]["responses"][201]["content"]["application/json"];
