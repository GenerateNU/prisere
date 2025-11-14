import { paths } from "@/schema";

export type CreateClaimRequest = NonNullable<paths["/claims"]["post"]["requestBody"]>["content"]["application/json"];
export type CreateClaimResponse = paths["/claims"]["post"]["responses"][201]["content"]["application/json"];
export type GetCompanyClaimResponse = paths["/claims/company"]["get"]["responses"][200]["content"]["application/json"];
export type GetClaimLineItemsResponse =
    paths["/claims/{id}/line-item"]["get"]["responses"][200]["content"]["application/json"];
export type GetCompanyClaimRequest = paths["/claims/company"]["get"]["parameters"]["query"];
export type GetClaimLineItemsRequest = paths["/claims/{id}/line-item"]["get"]["parameters"]["query"];
