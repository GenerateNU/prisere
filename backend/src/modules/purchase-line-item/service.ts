import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import { IPurchaseLineItemTransaction } from "./transaction";
import {
    CreateOrChangePurchaseLineItemsDTO,
    CreateOrChangePurchaseLineItemsResponse,
    GetPurchaseLineItemResponse,
    GetPurchaseLineItemsFromParentResponse,
} from "./types";
import Boom from "@hapi/boom";

export interface IPurchaseLineItemService {
    createOrUpdatePurchaseLineItems(
        payload: CreateOrChangePurchaseLineItemsDTO
    ): Promise<CreateOrChangePurchaseLineItemsResponse>;
    getPurchaseLineItem(id: string): Promise<GetPurchaseLineItemResponse>;
    getPurchaseLineItemsForPurchase(parentPurchaseId: string): Promise<GetPurchaseLineItemsFromParentResponse>;
}

export class PurchaseLineItemService implements IPurchaseLineItemService {
    private purchaseLineItemTransaction: IPurchaseLineItemTransaction;

    constructor(transaction: IPurchaseLineItemTransaction) {
        this.purchaseLineItemTransaction = transaction;
    }

    async createOrUpdatePurchaseLineItems(
        payload: CreateOrChangePurchaseLineItemsDTO
    ): Promise<CreateOrChangePurchaseLineItemsResponse> {
        return (await this.purchaseLineItemTransaction.createOrUpdatePurchaseLineItems(payload)).map(
            this.normalizeEntity
        );
    }

    async getPurchaseLineItem(id: string): Promise<GetPurchaseLineItemResponse> {
        const maybeLineItem = await this.purchaseLineItemTransaction.getPurchaseLineItem(id);

        if (!maybeLineItem) {
            throw Boom.notFound("Unable to find the purchase line item with the given id.");
        }

        return this.normalizeEntity(maybeLineItem);
    }

    async getPurchaseLineItemsForPurchase(parentPurchaseId: string): Promise<GetPurchaseLineItemsFromParentResponse> {
        return (await this.purchaseLineItemTransaction.getPurchaseLineItemsForPurchase(parentPurchaseId)).map(
            this.normalizeEntity
        );
    }

    normalizeEntity = (item: PurchaseLineItem) => {
        return {
            ...item,
            dateCreated: item.dateCreated.toUTCString(),
            lastUpdated: item.dateCreated.toUTCString(),
            quickbooksDateCreated: item.quickbooksDateCreated?.toUTCString(),
        };
    };
}
