import { authHeader, authWrapper, client } from "./client";
<<<<<<< HEAD
import { Invoice } from "../types/invoice";

export const getAllInvoicesForCompany = async (
    companyId: string,
    pageNumber: number,
    resultsPerPage: number
): Promise<Invoice[]> => {
    const req = async (token: string): Promise<Invoice[]> => {
        const { data, error, response } = await client.GET("/invoice", {
            params: {
                query: {
                    companyId: companyId,
                    pageNumber: pageNumber,
                    resultsPerPage: resultsPerPage,
                },
            },
            headers: authHeader(token),
        });
=======

export const sumInvoicesByCompanyAndDateRange = async (
    startDate: Date,
    endDate: Date,
): Promise<{ total: number }> => {
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

>>>>>>> origin/frontend-setup
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
<<<<<<< HEAD
    };
    return authWrapper<Invoice[]>()(req);
};
=======
    }

    return authWrapper<{ total: number }>()(req);

};
>>>>>>> origin/frontend-setup
export const sumInvoicesByCompanyAndDateRange = async (
    startDate: Date,
    endDate: Date,
): Promise<{ total: number }> => {
    const req = async (token: string): Promise<{ total: number }> => {
        const { data, error, response } = await client.GET("/invoice/bulk/totalIncome", {
            headers: authHeader(token),
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),


    }

    return authWrapper<{ total: number }>()(req);

};