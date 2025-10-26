import { paths } from "@/schema";

export type CreateClaimRequest = NonNullable<paths["/claims"]["post"]["requestBody"]>["content"]["application/json"];
export type CreateClaimResponse = paths["/claims"]["post"]["responses"][201]["content"]["application/json"];