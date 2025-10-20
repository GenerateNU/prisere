"use server";
import { Purchase } from "../types/purchase";
import { authHeader, authWrapper, getClient } from "./client";

export const getAllPurchasesForCompany = async (pageNumber: number, resultsPerPage: number): Promise<Purchase[]> => {
    const req = async (token: string): Promise<Purchase[]> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/purchase", {
            params: {
                query: {
                    pageNumber: pageNumber,
                    resultsPerPage: resultsPerPage,
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

    return authWrapper<Purchase[]>()(req);
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
