import type { paths } from "../schema";
export type Purchases = paths["/purchase"]["get"]["responses"]["200"]["content"]["application/json"];
export type PurchaseLineItem = paths["/purchase/line/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
