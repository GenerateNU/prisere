import { IQuickBooksPurchaseTransaction } from "./transaction";
import { withServiceErrorHandling } from "../../utilities/error";
import {
    CreateQuickBooksPurchaseDTO,
    CreateQuickBooksPurchaseResponse,
    GetCompanyQuickBooksPurchasesDTO,
    GetCompanyQuickBooksPurchasesResponse,
    GetQuickBooksPurchaseAPIResponse,
    PatchQuickBooksPurchaseDTO,
    PatchQuickBooksPurchasesResponse,
} from "./types";
import { CreateOrUpdateInvoiceDTO } from "../../types/Invoice";


// TODO: fix this interface and figure out what is happening with the types (API/ normal types??)
export interface IInvoiceService {
    createOrUpdateInvoice(payload: CreateOrUpdateInvoiceDTO): Promise<CreateOrUpdateInvoiceResponse>;
    getQuickBooksPurchase(id: string): Promise<GetQuickBooksPurchaseAPIResponse>;
    getQuickBooksPurchasesForCompany(
        payload: GetCompanyQuickBooksPurchasesDTO
    ): Promise<GetCompanyQuickBooksPurchasesResponse>;
}

export class QuickBooksPurchaseService implements IQuickBooksPurchaseService {
    private quickBooksPurchaseTransaction: IQuickBooksPurchaseTransaction;

    constructor(qbTransaction: IQuickBooksPurchaseTransaction) {
        this.quickBooksPurchaseTransaction = qbTransaction;
    }

    updateQuickBooksPurchase = withServiceErrorHandling(
        async (id: string, payload: PatchQuickBooksPurchaseDTO): Promise<PatchQuickBooksPurchasesResponse> => {
            const newQBPurchase = await this.quickBooksPurchaseTransaction.updateQuickBooksPurchase(id, payload);

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

    createQuickBooksPurchase = withServiceErrorHandling(
        async (payload: CreateQuickBooksPurchaseDTO): Promise<CreateQuickBooksPurchaseResponse> => {
            const newQBPurchase = await this.quickBooksPurchaseTransaction.createQuickBooksPurchase(payload);

            return {
                comapnyId: newQBPurchase.companyId,
                id: newQBPurchase.id,
                isRefund: newQBPurchase.isRefund,
                quickBooksID: newQBPurchase.quickbooksId,
                totalAmountCents: newQBPurchase.totalAmountCents,
            };
        }
    );

    getQuickBooksPurchase = withServiceErrorHandling(async (id: string): Promise<GetQuickBooksPurchaseAPIResponse> => {
        const qbPurchase = await this.quickBooksPurchaseTransaction.getQuickBooksPurchase(id);

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

    getQuickBooksPurchasesForCompany = withServiceErrorHandling(
        async (payload: GetCompanyQuickBooksPurchasesDTO): Promise<GetCompanyQuickBooksPurchasesResponse> => {
            const qbPurchases = await this.quickBooksPurchaseTransaction.getQuickBooksPurchasesForCompany(payload);

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