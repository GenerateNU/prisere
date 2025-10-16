
export const getAllPurchasesForCompany = async (
    companyId: string,
    pageNumber: number,
    resultsPerPage: number
): Promise<Purchase[]> => {
    const req = async (token: string): Promise<Purchase[]> => {
        const { data, error, response } = await client.GET("/purchase", {
export const sumPurchasesByCompanyAndDateRange = async (
    startDate: Date,
    endDate: Date,
): Promise<{ total: number }> => {
    const req = async (token: string): Promise<{ total: number }> => {
        const { data, error, response } = await client.GET("/purchase/bulk/totalExpenses", {
            headers: authHeader(token),
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    companyId: companyId,
                    pageNumber: pageNumber,
                    resultsPerPage: resultsPerPage,
            },
            headers: authHeader(token),
            }

    }

    return authWrapper<{ total: number }>()(req);
}

    };
    return authWrapper<Purchase[]>()(req);
};
