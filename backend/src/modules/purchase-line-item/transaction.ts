import { DataSource, In } from "typeorm";
import Boom from "@hapi/boom";
import { CreateOrChangePurchaseLineItemsDTO } from "./types";
import { Purchase } from "../../entities/Purchase";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";

export interface IPurchaseLineItemTransaction {
    createOrUpdatePurchaseLineItems(payload: CreateOrChangePurchaseLineItemsDTO): Promise<PurchaseLineItem[]>;
    getPurchaseLineItem(id: string): Promise<PurchaseLineItem | null>;
    getPurchaseLineItemsForPurchase(purchaseId: string): Promise<PurchaseLineItem[]>;
}

export class PurchaseLineItemTransaction implements IPurchaseLineItemTransaction {
    private db: DataSource;

    constructor(db: DataSource) {
        this.db = db;
    }

    async createOrUpdatePurchaseLineItems(payload: CreateOrChangePurchaseLineItemsDTO): Promise<PurchaseLineItem[]> {
        const savedEntites = await this.db.manager.save(PurchaseLineItem, payload);
        const savedEntityIds = savedEntites.map((entity) => entity.id);
        return await this.db.manager.find(PurchaseLineItem, { where: { id: In(savedEntityIds) } });
    }

    async getPurchaseLineItem(id: string): Promise<PurchaseLineItem | null> {
        return await this.db.manager.findOne(PurchaseLineItem, { where: { id: id } });
    }

    async getPurchaseLineItemsForPurchase(purchaseId: string): Promise<PurchaseLineItem[]> {
        const givenPurchase = await this.db.manager.findOne(Purchase, {
            where: {
                id: purchaseId,
            },
            relations: {
                lineItems: true,
            },
        });

        if (!givenPurchase) {
            throw Boom.notFound("Unable to find the given purchase");
        }

        return givenPurchase.lineItems;
    }
}
