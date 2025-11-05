"use server";
import { FilteredPurchases, Purchases } from "../types/purchase";
import { authHeader, authWrapper, getClient } from "./client";

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

export const getAllPurchaseCategories = async (): Promise<string[]> => {
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
