import { IPurchaseTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    CreatePurchaseDTO,
    CreatePurchaseResponse,
    GetCompanyPurchasesDTO,
    GetCompanyPurchasesResponse,
    GetPurchaseAPIResponse,
    PatchPurchaseDTO,
    PatchPurchasesResponse,
} from "./types";

export interface IPurchaseService {
    updatePurchase(id: string, payload: PatchPurchaseDTO): Promise<PatchPurchasesResponse>;
    createPurchase(payload: CreatePurchaseDTO): Promise<CreatePurchaseResponse>;
    getPurchase(id: string): Promise<GetPurchaseAPIResponse>;
    getPurchasesForCompany(payload: GetCompanyPurchasesDTO): Promise<GetCompanyPurchasesResponse>;
}

export class PurchaseService implements IPurchaseService {
    private PurchaseTransaction: IPurchaseTransaction;

    constructor(qbTransaction: IPurchaseTransaction) {
        this.PurchaseTransaction = qbTransaction;
    }

    updatePurchase = withServiceErrorHandling(
        async (id: string, payload: PatchPurchaseDTO): Promise<PatchPurchasesResponse> => {
            const newQBPurchase = await this.PurchaseTransaction.updatePurchase(id, payload);

            return {
                comapnyId: newQBPurchase.companyId,
                dateCreated: newQBPurchase.dateCreated,
                id: newQBPurchase.id,
                isRefund: newQBPurchase.isRefund,
                quickBooksID: newQBPurchase.quickbooksId,
                totalAmountCents: newQBPurchase.totalAmountCents,
            };
        }
    );

    createPurchase = withServiceErrorHandling(async (payload: CreatePurchaseDTO): Promise<CreatePurchaseResponse> => {
        const newQBPurchase = await this.PurchaseTransaction.createPurchase(payload);

        return {
            comapnyId: newQBPurchase.companyId,
            id: newQBPurchase.id,
            isRefund: newQBPurchase.isRefund,
            quickBooksID: newQBPurchase.quickbooksId,
            totalAmountCents: newQBPurchase.totalAmountCents,
        };
    });

    getPurchase = withServiceErrorHandling(async (id: string): Promise<GetPurchaseAPIResponse> => {
        const qbPurchase = await this.PurchaseTransaction.getPurchase(id);

        return {
            dateCreated: qbPurchase.dateCreated,
            lastUpdated: qbPurchase.dateCreated,
            comapnyId: qbPurchase.companyId,
            id: qbPurchase.id,
            isRefund: qbPurchase.isRefund,
            quickBooksID: qbPurchase.quickbooksId,
            totalAmountCents: qbPurchase.totalAmountCents,
        };
    });

    getPurchasesForCompany = withServiceErrorHandling(
        async (payload: GetCompanyPurchasesDTO): Promise<GetCompanyPurchasesResponse> => {
            const qbPurchases = await this.PurchaseTransaction.getPurchasesForCompany(payload);

            return qbPurchases.map((qbPurchase) => ({
                comapnyId: qbPurchase.companyId,
                dateCreated: qbPurchase.dateCreated,
                id: qbPurchase.id,
                isRefund: qbPurchase.isRefund,
                quickBooksID: qbPurchase.quickbooksId,
                totalAmountCents: qbPurchase.totalAmountCents,
            }));
        }
    );
}
