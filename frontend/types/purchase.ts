import type { paths } from "../schema";
export type Purchase = paths["/purchase/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type CreatePurchaseInput = paths["/purchase/bulk"]["post"]["requestBody"]["content"]["application/json"];
export type CreatePurchaseResponse = paths["/purchase/bulk"]["post"]["responses"]["200"]["content"]["application/json"];
