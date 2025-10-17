import type { paths } from "../schema";
export type TotalInvoiceSum =
    paths["/invoice/bulk/totalIncome"]["get"]["responses"]["200"]["content"]["application/json"];
export type Invoice = paths["/invoice"]["get"]["responses"]["200"]["content"]["application/json"];
