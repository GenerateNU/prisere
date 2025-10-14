import { DataSource, In } from "typeorm";
import Boom from "@hapi/boom";
import { CreateOrChangePurchaseLineItemsDTO } from "./types";
import { Purchase } from "../../entities/Purchase";
import { PurchaseLineItem } from "../../entities/PurchaseLineItem";
import { plainToInstance } from "class-transformer";

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
        const normalizedPayload = payload.map((element) => plainToInstance(PurchaseLineItem, element));
        const uniquePurchaseIds = [...new Set(payload.map((element) => element.purchaseId))];

        const givenPurchaseIds = await this.db.manager.find(Purchase, { where: { id: In(uniquePurchaseIds) } });

        if (givenPurchaseIds.length !== uniquePurchaseIds.length) {
            throw Boom.notFound("Not all of the provided purchase Ids exist in the purchase table.");
        }

        return (
            await this.db
                .createQueryBuilder()
                .insert()
                .into(PurchaseLineItem)
                .values(normalizedPayload)
                .orUpdate(
                    ["amountCents", "description", "quickbooksDateCreated", "category", "type"],
                    ["quickBooksId", "purchaseId"]
                )
                .returning("*")
                .execute()
        ).raw;
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
