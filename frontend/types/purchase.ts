import type { paths } from "../schema";
export type Purchase = paths["/purchase/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type CreatePurchaseInput = paths["/purchase/bulk"]["post"]["requestBody"]["content"]["application/json"];
export type CreatePurchaseResponse = paths["/purchase/bulk"]["post"]["responses"]["200"]["content"]["application/json"];
export type PurchasesWithCount = paths["/purchase"]["get"]["responses"]["200"]["content"]["application/json"];
export type Purchases = PurchasesWithCount["purchases"]
export type PurchaseLineItem = paths["/purchase/line/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type PurchaseWithLineItems = Purchases[number]


export enum PurchaseLineItemType {
    EXTRANEOUS = "extraneous",
    TYPICAL = "typical",
    PENDING = "pending",
    SUG_EX = "suggested extraneous",
    SUG_TY = "suggested typical",
}

export enum SortByColumn {
    DATE = "date",
    AMOUNT = "totalAmountCents",
}

export type DisasterType = "extraneous" | "typical" | "pending" | "suggested extraneous" | "suggested typical";

export type FilteredPurchases = {
    pageNumber: number;
    resultsPerPage: number;
    sortBy?: SortByColumn;
    sortOrder?: "ASC" | "DESC";
    categories?: string[];
    type?: PurchaseLineItemType;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
};
