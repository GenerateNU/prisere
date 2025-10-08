import { IPurchaseTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    CreateOrChangePurchaseDTO,
    CreateOrChangePurchaseResponse,
    GetCompanyPurchasesDTO,
    GetCompanyPurchasesResponse,
    GetPurchaseResponse,
} from "./types";
import { Purchase } from "../../entities/Purchase";

export interface IPurchaseService {
    createOrUpdatePurchase(payload: CreateOrChangePurchaseDTO): Promise<CreateOrChangePurchaseResponse>;
    getPurchase(id: string): Promise<GetPurchaseResponse>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<GetCompanyPurchasesResponse>;
}

export class PurchaseService implements IPurchaseService {
    private PurchaseTransaction: IPurchaseTransaction;

    constructor(qbTransaction: IPurchaseTransaction) {
        this.PurchaseTransaction = qbTransaction;
    }

    createOrUpdatePurchase = withServiceErrorHandling(
        async (payload: CreateOrChangePurchaseDTO): Promise<CreateOrChangePurchaseResponse> => {
            let newPurchases: Purchase[];
            try {
                newPurchases = await this.PurchaseTransaction.createOrUpdatePurchase(payload);
            } catch (err: unknown) {
                console.log(err);
                throw err;
            }

            console.log(newPurchases.slice(0, 3), "...");
            return newPurchases.map((newPurchase) => ({
                ...newPurchase,
                dateCreated: newPurchase.dateCreated.toUTCString(),
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
            }));
        }
    );
}
