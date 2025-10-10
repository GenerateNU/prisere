import { IPurchaseTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    CreateOrChangePurchaseDTO,
    CreateOrChangePurchaseResponse,
    GetCompanyPurchasesByDateDTO,
    GetCompanyPurchasesDTO,
    GetCompanyPurchasesResponse,
    GetPurchaseResponse,
} from "./types";

export interface IPurchaseService {
    createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<CreateOrChangePurchaseResponse>;
    getPurchase(id: string): Promise<GetPurchaseResponse>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<GetCompanyPurchasesResponse>;
    sumPurchasesByCompanyAndDateRange(payload: GetCompanyPurchasesByDateDTO): Promise<number>;
}

export class PurchaseService implements IPurchaseService {
    private PurchaseTransaction: IPurchaseTransaction;

    constructor(qbTransaction: IPurchaseTransaction) {
        this.PurchaseTransaction = qbTransaction;
    }

    createOrUpdatePurchase = withServiceErrorHandling(
        async (payload: CreateOrChangePurchaseDTO): Promise<CreateOrChangePurchaseResponse> => {
            const newPurchases = await this.PurchaseTransaction.createOrUpdatePurchase(payload);

            return newPurchases.map((newPurchase) => ({
                ...newPurchase,
                dateCreated: newPurchase.dateCreated.toUTCString(),
                lastUpdated: newPurchase.lastUpdated.toUTCString(),
                quickbooksDateCreated: newPurchase.quickbooksDateCreated?.toUTCString(),
            }));
        }
    );

    getPurchase = withServiceErrorHandling(async (id: string): Promise<GetPurchaseResponse> => {
        const qbPurchase = await this.PurchaseTransaction.getPurchase(id);

        return {
            dateCreated: qbPurchase.dateCreated.toUTCString(),
            lastUpdated: qbPurchase.dateCreated.toUTCString(),
            companyId: qbPurchase.companyId,
            id: qbPurchase.id,
            isRefund: qbPurchase.isRefund,
            quickBooksId: qbPurchase.quickBooksId,
            quickbooksDateCreated: qbPurchase.quickbooksDateCreated?.toUTCString(),
            totalAmountCents: qbPurchase.totalAmountCents,
        };
    });

    getPurchasesForCompany = withServiceErrorHandling(
        async (payload: GetCompanyPurchasesDTO): Promise<GetCompanyPurchasesResponse> => {
            const qbPurchases = await this.PurchaseTransaction.getPurchasesForCompany(payload);

            return qbPurchases.map((qbPurchase) => ({
                companyId: qbPurchase.companyId,
                dateCreated: qbPurchase.dateCreated.toUTCString(),
                id: qbPurchase.id,
                isRefund: qbPurchase.isRefund,
                quickBooksID: qbPurchase.quickBooksId,
                totalAmountCents: qbPurchase.totalAmountCents,
                quickbooksDateCreated: qbPurchase.quickbooksDateCreated?.toUTCString(),
            }));
        }
    );

    sumPurchasesByCompanyAndDateRange = withServiceErrorHandling(
        async (payload: GetCompanyPurchasesByDateDTO): Promise<number> => {
            const purchases = await this.PurchaseTransaction.sumPurchasesByCompanyAndDateRange(payload);

            return purchases;
        }
    );
}
