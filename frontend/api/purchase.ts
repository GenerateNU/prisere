import { Purchase } from "../types/purchase";
import { authHeader, authWrapper, client } from "./client";

export const getAllPurchasesForCompany =
    async (
        companyId: string,
        pageNumber?: number,
        resultsPerPage?: number): Promise<Purchase[]> => {
        const req = async (token: string): Promise<Purchase[]> => {
            const { data, error, response } = await client.GET("/purchase", {
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
        return authWrapper<Purchase[]>()(req);
}
