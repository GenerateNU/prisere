import { expect } from "bun:test";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CompareRequestToCreated(requestBody: any[], response: any[]) {
    expect(response.length).toBe(requestBody.length);
    for (let b = 0; b < response.length; b++) {
        const responseElem = response[b];
        const requestElem = requestBody[b];
        expect(responseElem.invoiceId).toBe(requestElem.invoiceId);
        // compare that the days are the same (actual timestamp will be different)
        expect(new Date(responseElem.lastUpdated).toISOString().split("T")[0]).toBe(
            new Date().toISOString().split("T")[0]
        );
        expect(responseElem.amountCents).toBe(requestElem.amountCents);
        expect(new Date(responseElem.dateCreated).toISOString()).toBe(new Date(requestElem.dateCreated).toISOString());

        if (requestElem.quickbooksId) {
            expect(responseElem.quickbooksId).toBe(requestElem.quickbooksId);
        }
        if (requestElem.description) {
            expect(responseElem.description).toBe(requestElem.description);
        }
        if (requestElem.category) {
            expect(responseElem.category).toBe(requestElem.category);
        }
    }
}
