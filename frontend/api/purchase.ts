"use server";
import { FilteredPurchases, PurchaseLineItemType, Purchases } from "../types/purchase";
import { authHeader, authWrapper, getClient, getClientAuthToken } from "./client";
import { useQuery } from "@tanstack/react-query";

export const getAllPurchasesForCompany = async (filters: FilteredPurchases): Promise<Purchases> => {
    const req = async (token: string): Promise<Purchases> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/purchase", {
            params: {
                query: {
                    pageNumber: filters.pageNumber,
                    resultsPerPage: filters.resultsPerPage,
                    categories: filters.categories,
                    type: filters.type,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    search: filters.search,
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder,
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

    return authWrapper<Purchases>()(req);
};

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

type typeString = "typical" | "extraneous";

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

export function useFetchPurchases(filters: FilteredPurchases) {
    return useQuery({
        queryKey: ["purchases-for-company", filters],
        queryFn: async ({ signal }) => {
            const token = await getClientAuthToken();
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
                signal,
            });
            if (response.ok) {
                return data;
            } else {
                throw Error(error?.error);
            }
        },
    });
}

export function useFetchAllCategories() {
    return useQuery({
        queryKey: ["categories-for-purchases"],
        queryFn: async (): Promise<string[]> => {
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
        },
    });
}
