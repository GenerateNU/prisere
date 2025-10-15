import { authHeader, authWrapper, client } from "./client";

export const sumInvoicesByCompanyAndDateRange = async (
    companyId: string,
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

        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    }

    return authWrapper<{ total: number }>()(req);

};