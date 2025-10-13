import type { paths } from "../schema";

export type GetPurchasesForCompanyResponse = paths["/purchase"]["get"]["responses"]["200"]["content"]["application/json"];
export type Purchase = paths["/purchase/{id}"]["get"]["responses"]["200"]["content"]["application/json"];