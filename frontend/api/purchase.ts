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

export const sumPurchasesByCompanyAndDateRange = async (startDate: Date, endDate: Date): Promise<{ total: number }> => {
    const req = async (token: string): Promise<{ total: number }> => {
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
            return data!;
        } else {
            throw Error(error?.error);
        }
    };

    return authWrapper<{ total: number }>()(req);
};

export const updateCategory = async (category: string, purchaseLineIds: string[], removeCategory: boolean) => {
    const req = async (token: string) => {
        const client = getClient();
        for (let i = 0; i < purchaseLineIds.length; i++) {
            const { error, response } = await client.PATCH("/purchase/line/category", {
                headers: authHeader(token),
                body: {
                    id: purchaseLineIds[i],
                    category: category,
                    removeCategory: removeCategory,
                },
            });

            if (!response.ok) {
                throw Error(error?.error);
            }
        }
    };

    return authWrapper<void>()(req);
};

const typeMap: Record<string, PurchaseLineItemType> = {
    typical: PurchaseLineItemType.TYPICAL,
    extraneous: PurchaseLineItemType.EXTRANEOUS,
};

type typeString = "extraneous" | "typical" | "pending" | "suggested extraneous" | "suggested typical";

export const updateType = async (type: typeString, purchaseLineIds: string[]) => {
    const req = async (token: string) => {
        const client = getClient();
        for (let i = 0; i < purchaseLineIds.length; i++) {
            const { error, response } = await client.PATCH("/purchase/line/type", {
                headers: authHeader(token),
                body: {
                    id: purchaseLineIds[i],
                    type: typeMap[type],
                },
            });

            if (!response.ok) {
                throw Error(error?.error);
            }
        }
    };

    return authWrapper<void>()(req);
};

export const createPurchaseForCompany = async (newPurchase: CreatePurchaseInput): Promise<CreatePurchaseResponse> => {
    const req = async (token: string): Promise<CreatePurchaseResponse> => {
        const client = getClient();
        const { data, error, response } = await client.POST("/purchase/bulk", {
            body: newPurchase,
            headers: authHeader(token),
        });

        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };

    return authWrapper<CreatePurchaseResponse>()(req);
};

export const fetchPurchases = async (filters: FilteredPurchases): Promise<PurchasesWithCount> => {
    const req = async (token: string): Promise<PurchasesWithCount> => {
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
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<PurchasesWithCount>()(req);
};

export const fetchAllCategories = async (): Promise<string[]> => {
    const req = async (token: string): Promise<string[]> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/purchase/categories", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return authWrapper<string[]>()(req);
};

export const getAllPurchasesForExport = async (
    filters: FilteredPurchases,
    total: number
): Promise<PurchaseWithLineItems[]> => {
    const req = async (token: string): Promise<PurchaseWithLineItems[]> => {
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
            return data?.purchases || [];
        } else {
            throw Error(error?.error);
        }
    };

    return authWrapper<PurchaseWithLineItems[]>()(req);
};
