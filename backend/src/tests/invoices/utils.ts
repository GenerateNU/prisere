import { expect } from "bun:test";

export function CompareRequestToCreated(requestBody: any[], response: any[]) {
    expect(response.length).toBe(requestBody.length);
    for (let b = 0; b < response.length; b++) {
        const responseElem = response[b];
        const requestElem = requestBody[b];
        expect(responseElem.companyId).toBe(requestElem.companyId);
        // compare that the days are the same (actual timestamp will be different)
        expect(new Date(responseElem.lastUpdated).toISOString().split('T')[0]).toBe(new Date().toISOString().split('T')[0]);
        expect(responseElem.totalAmountCents).toBe(requestElem.totalAmountCents);
        expect(new Date(responseElem.dateCreated).toISOString()).toBe(new Date(requestElem.dateCreated).toISOString());

        if (requestElem.quickbooksId) {
            expect(responseElem.quickbooksId).toBe(requestElem.quickbooksId);
        }
    }
}