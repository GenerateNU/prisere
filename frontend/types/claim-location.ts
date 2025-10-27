import { paths } from "@/schema";

export type CreateClaimLocationRequest = NonNullable<
    paths["/claim-locations"]["post"]["requestBody"]
>["content"]["application/json"];
export type CreateClaimLocationResponse =
    paths["/claim-locations"]["post"]["responses"][201]["content"]["application/json"];
