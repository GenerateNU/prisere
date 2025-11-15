import { paths } from "@/schema";

export type InsurancePolicy = paths["/insurance"]["post"]["responses"]["201"]["content"]["application/json"];

export type CreateInsurancePolicyRequest = paths["/insurance"]["post"]["requestBody"]["content"]["application/json"];
export type CreateInsurancePolicyResponse =
    paths["/insurance"]["post"]["responses"]["201"]["content"]["application/json"];

export type CreateInsurancePolicyBulkRequest =
    paths["/insurance/bulk"]["post"]["requestBody"]["content"]["application/json"];
export type CreateInsurancePolicyBulkResponse =
    paths["/insurance/bulk"]["post"]["responses"]["201"]["content"]["application/json"];

export type GetInsurancePoliciesResponseType =
    paths["/insurance"]["get"]["responses"]["200"]["content"]["application/json"];

export type UpdateInsurancePolicyRequest = paths["/insurance"]["patch"]["requestBody"]["content"]["application/json"];
export type UpdateInsurancePolicyResponse =
    paths["/insurance"]["patch"]["responses"]["200"]["content"]["application/json"];
export type UpdateInsurancePolicyBulkRequest = paths["/insurance/bulk"]["patch"]["requestBody"]["content"]["application/json"];
export type UpdateInsurancePolicyBulkResponse =
    paths["/insurance/bulk"]["patch"]["responses"]["200"]["content"]["application/json"];