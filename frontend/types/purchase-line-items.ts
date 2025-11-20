import { paths } from "@/schema";

export type CreatePurchaseLineItemsRequest =
    paths["/purchase/line/bulk"]["post"]["requestBody"]["content"]["application/json"];

export type CreatePurchaseLineItemsResponse =
    paths["/purchase/line/bulk"]["post"]["responses"]["200"]["content"]["application/json"];
