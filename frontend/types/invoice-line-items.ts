import { paths } from "@/schema";

export type CreateInvoiceLineItemsRequest =
    paths["/invoice/line/bulk"]["post"]["requestBody"]["content"]["application/json"];

export type CreateInvoiceLineItemsResponse =
    paths["/invoice/line/bulk"]["post"]["responses"]["201"]["content"]["application/json"];
