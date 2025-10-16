import { authHeader, authWrapper, client } from "./client";
import { Invoice } from "../types/invoice";

export const getAllInvoicesForCompany = async (pageNumber: number, resultsPerPage: number): Promise<Invoice[]> => {
    const req = async (token: string) => {
        const { data, error, response } = await client.GET("/invoice", {
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
    return authWrapper<Invoice[]>()(req);
};

export const sumInvoicesByCompanyAndDateRange = async (startDate: Date, endDate: Date): Promise<{ total: number }> => {
    const req = async (token: string): Promise<{ total: number }> => {
        const { data, error, response } = await client.GET("/invoice/bulk/totalIncome", {
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
