"use server";
import {
    CreatePurchaseInput,
    CreatePurchaseResponse,
    FilteredPurchases,
    PurchaseLineItemType,
    PurchasesWithCount,
    PurchaseWithLineItems,
} from "../types/purchase";
import { authHeader, authWrapper, getClient } from "./client";
import { ServerActionResult } from "./types";

export const sumPurchasesByCompanyAndDateRange = async (
    startDate: Date,
    endDate: Date
): Promise<ServerActionResult<{ total: number }>> => {
    const req = async (token: string): Promise<ServerActionResult<{ total: number }>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/purchase/bulk/totalExpenses", {
            headers: authHeader(token),
            params: {
                query: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                },
            },
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to sum purchases" };
        }
    };

    return authWrapper<ServerActionResult<{ total: number }>>()(req);
};

export const updateCategory = async (
    category: string,
    purchaseLineIds: string[],
    removeCategory: boolean
): Promise<ServerActionResult<void>> => {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();
        const { error, response } = await client.PATCH("/purchase/line/category", {
            headers: authHeader(token),
            body: {
                ids: purchaseLineIds,
                category: category,
                removeCategory: removeCategory,
            },
        });

        if (response.ok) {
            return { success: true, data: undefined };
        } else {
            return { success: false, error: error?.error || "Failed to update category" };
        }
    };

    return authWrapper<ServerActionResult<void>>()(req);
};

const typeMap: Record<string, PurchaseLineItemType> = {
    typical: PurchaseLineItemType.TYPICAL,
    extraneous: PurchaseLineItemType.EXTRANEOUS,
};

type typeString = "extraneous" | "typical" | "pending" | "suggested extraneous" | "suggested typical";

export const updateType = async (type: typeString, purchaseLineIds: string[]): Promise<ServerActionResult<void>> => {
    const req = async (token: string): Promise<ServerActionResult<void>> => {
        const client = getClient();
        const { error, response } = await client.PATCH("/purchase/line/type", {
            headers: authHeader(token),
            body: {
                ids: purchaseLineIds,
                type: typeMap[type],
            },
        });
        if (response.ok) {
            return { success: true, data: undefined };
        } else {
            return { success: false, error: error?.error || "Failed to update type" };
        }
    };

    return authWrapper<ServerActionResult<void>>()(req);
};

export const createPurchaseForCompany = async (
    newPurchase: CreatePurchaseInput
): Promise<ServerActionResult<CreatePurchaseResponse>> => {
    const req = async (token: string): Promise<ServerActionResult<CreatePurchaseResponse>> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/purchase/bulk", {
            body: newPurchase,
            headers: authHeader(token),
        });

        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to create purchase" };
        }
    };

    return authWrapper<ServerActionResult<CreatePurchaseResponse>>()(req);
};

export const fetchPurchases = async (filters: FilteredPurchases): Promise<ServerActionResult<PurchasesWithCount>> => {
    const req = async (token: string): Promise<ServerActionResult<PurchasesWithCount>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/purchase", {
            params: {
                query: {
                    categories: filters.categories,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    search: filters.search,
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder,
                    pageNumber: filters.pageNumber,
                    resultsPerPage: filters.resultsPerPage,
                    type: filters.type,
                },
            },
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to fetch purchases" };
        }
    };
    return authWrapper<ServerActionResult<PurchasesWithCount>>()(req);
};

export const fetchAllCategories = async (): Promise<ServerActionResult<string[]>> => {
    const req = async (token: string): Promise<ServerActionResult<string[]>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/purchase/categories", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return { success: true, data: data! };
        } else {
            return { success: false, error: error?.error || "Failed to fetch categories" };
        }
    };
    return authWrapper<ServerActionResult<string[]>>()(req);
};

export const getAllPurchasesForExport = async (
    filters: FilteredPurchases,
    total: number
): Promise<ServerActionResult<PurchaseWithLineItems[]>> => {
    const req = async (token: string): Promise<ServerActionResult<PurchaseWithLineItems[]>> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/purchase", {
            headers: authHeader(token),
            params: {
                query: {
                    categories: filters.categories,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    search: filters.search,
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder,
                    type: filters.type,
                    resultsPerPage: total,
                },
            },
        });

        if (response.ok) {
            return { success: true, data: data?.purchases || [] };
        } else {
            return { success: false, error: error?.error || "Failed to get purchases for export" };
        }
    };

    return authWrapper<ServerActionResult<PurchaseWithLineItems[]>>()(req);
};
