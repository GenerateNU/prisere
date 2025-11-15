import type { paths } from "../schema";

export type CreateCompanyRequest = paths["/companies"]["post"]["requestBody"]["content"]["application/json"];
export type CreateCompanyResponse = paths["/companies"]["post"]["responses"];

export type GetCompanyLocationsRequest = paths["/companies/location-address"]["get"];
export type GetCompanyLocationsResponse =
    paths["/companies/location-address"]["get"]["responses"][200]["content"]["application/json"];

export type Company = paths["/companies"]["post"]["responses"][201]["content"]["application/json"];

export type UpdateCompanyRequest = paths["/companies"]["patch"]["requestBody"]["content"]["application/json"];
export type UpdateCompanyResponse = paths["/companies"]["patch"]["responses"][200]["content"]["application/json"];

export const businessTypes = ["LLC", "Sole Proprietorship", "Corporation", "Partnership"];

export type GetClaimInProgressForCompanyResponse =
    paths["/companies/claim-in-progress"]["get"]["responses"][200]["content"]["application/json"];
