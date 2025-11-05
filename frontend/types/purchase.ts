import type { paths } from "../schema";
export type Purchases = paths["/purchase"]["get"]["responses"]["200"]["content"]["application/json"];
export type PurchaseLineItem = paths["/purchase/line/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export enum PurchaseLineItemType {
    EXTRANEOUS = "extraneous",
    TYPICAL = "typical",
}

export enum SortByColumn {
    DATE = "date",
    AMOUNT = "totalAmountCents",
}

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
