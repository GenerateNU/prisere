"use server";
import { CreatePurchaseInput, CreatePurchaseResponse, PurchaseLineItemType } from "../types/purchase";
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
