import { IPurchaseTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    CreateOrPatchPurchaseResponse,
    CreatePurchaseDTO,
    GetCompanyPurchasesDTO,
    GetCompanyPurchasesResponse,
    GetPurchaseAPIResponse,
    PatchPurchaseDTO,
} from "./types";

export interface IPurchaseService {
    updatePurchase(payload: PatchPurchaseDTO): Promise<CreateOrPatchPurchaseResponse>;
    createPurchase(payload: CreatePurchaseDTO): Promise<CreateOrPatchPurchaseResponse>;
    getPurchase(id: string): Promise<GetPurchaseAPIResponse>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<GetCompanyPurchasesResponse>;
}

export class PurchaseService implements IPurchaseService {
    private PurchaseTransaction: IPurchaseTransaction;

    constructor(qbTransaction: IPurchaseTransaction) {
        this.PurchaseTransaction = qbTransaction;
    }

    updatePurchase = withServiceErrorHandling(
        async (payload: PatchPurchaseDTO): Promise<CreateOrPatchPurchaseResponse> => {
            const newQBPurchase = await this.PurchaseTransaction.updatePurchase(payload.purchaseId, payload);

            return {
                companyId: newQBPurchase.companyId,
                dateCreated: newQBPurchase.dateCreated,
                id: newQBPurchase.id,
                isRefund: newQBPurchase.isRefund,
                quickBooksId: newQBPurchase.quickBooksId,
                totalAmountCents: newQBPurchase.totalAmountCents,
            };
        }
    );

    createPurchase = withServiceErrorHandling(
        async (payload: CreatePurchaseDTO): Promise<CreateOrPatchPurchaseResponse> => {
            const newPurchase = await this.PurchaseTransaction.createPurchase(payload);

            return {
                companyId: newPurchase.companyId,
                id: newPurchase.id,
                isRefund: newPurchase.isRefund,
                quickBooksId: newPurchase.quickBooksId,
                totalAmountCents: newPurchase.totalAmountCents,
                dateCreated: newPurchase.dateCreated,
            };
        }
    );

    getPurchase = withServiceErrorHandling(async (id: string): Promise<GetPurchaseAPIResponse> => {
        const qbPurchase = await this.PurchaseTransaction.getPurchase(id);

        return {
            dateCreated: qbPurchase.dateCreated,
            lastUpdated: qbPurchase.dateCreated,
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
                dateCreated: qbPurchase.dateCreated,
                id: qbPurchase.id,
                isRefund: qbPurchase.isRefund,
                quickBooksID: qbPurchase.quickBooksId,
                totalAmountCents: qbPurchase.totalAmountCents,
            }));
        }
    );
}
