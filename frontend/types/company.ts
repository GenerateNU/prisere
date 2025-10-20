import type { paths } from "../schema";

export type CreateCompanyRequest = paths["/companies"]["post"]["requestBody"]["content"]["application/json"];
export type CreateCompanyResponse = paths["/companies"]["post"]["responses"];

export type Company = paths["/companies"]["post"]["responses"][201]["content"]["application/json"];
