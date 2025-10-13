import { Invoice } from "../types/invoice";
import { authHeader, authWrapper, client } from "./client";

export const getAllInvoicesForCompany =
    async (
        companyId: string,
        pageNumber?: number,
        resultsPerPage?: number): Promise<Invoice[]> => {
        const req = async (token: string): Promise<Invoice[]> => {
            const { data, error, response } = await client.GET("/invoice", {
                params: {
                    query: {
                        companyId: companyId,
                        pageNumber: pageNumber,
                        limit: resultsPerPage,
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
    }
