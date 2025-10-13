import type { paths } from "../schema";

export type GetInvoicesForCompanyResponse = paths["/invoice"]["get"]["responses"]["200"]["content"]["application/json"];
export type Invoice = paths["/invoice/{id}"]["get"]["responses"]["200"]["content"]["application/json"];