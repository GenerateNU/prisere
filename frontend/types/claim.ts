import { paths } from "@/schema";

export type CreateClaimRequest = NonNullable<paths["/claims"]["post"]["requestBody"]>["content"]["application/json"];
export type CreateClaimResponse = paths["/claims"]["post"]["responses"][201]["content"]["application/json"];
export type GetCompanyClaimResponse = paths["/claims/company"]["get"]["responses"][200]["content"]["application/json"];
export type GetClaimLineItemsResponse =
    paths["/claims/{id}/line-item"]["get"]["responses"][200]["content"]["application/json"];
export type GetCompanyClaimRequest = paths["/claims/company"]["get"]["parameters"]["query"];
export type GetClaimLineItemsRequest = paths["/claims/{id}/line-item"]["get"]["parameters"]["query"];

export enum ClaimStatusType {
    ACTIVE = "ACTIVE",
    FILED = "FILED",
    IN_PROGRESS_DISASTER = "IN_PROGRESS_DISASTER",
    IN_PROGRESS_PERSONAL = "IN_PROGRESS_PERSONAL",
    IN_PROGRESS_BUSINESS = "IN_PROGRESS_BUSINESS",
    IN_PROGRESS_INSURANCE = "IN_PROGRESS_INSURANCE",
    IN_PROGRESS_EXPORT = "IN_PROGRESS_EXPORT",
}

export const ClaimInProgressIndexMapping = {
    [ClaimStatusType.IN_PROGRESS_DISASTER]: 1,
    [ClaimStatusType.IN_PROGRESS_PERSONAL]: 2,
    [ClaimStatusType.IN_PROGRESS_BUSINESS]: 3,
    [ClaimStatusType.IN_PROGRESS_INSURANCE]: 4,
    [ClaimStatusType.IN_PROGRESS_EXPORT]: 5,
};

export const ClaimStatusInProgressTypes = Object.values(ClaimStatusType).filter((status) =>
    status.startsWith("IN_PROGRESS_")
) as ClaimStatusType[];
