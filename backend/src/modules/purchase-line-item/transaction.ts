import { DataSource, In } from "typeorm";
import Boom from "@hapi/boom";
import { CreateOrChangePurchaseLineItemsDTO } from "./types";
import { Purchase } from "../../entities/Purchase";
import { PurchaseLineItem, PurchaseLineItemType } from "../../entities/PurchaseLineItem";
import { plainToInstance } from "class-transformer";

export interface IPurchaseLineItemTransaction {
    createOrUpdatePurchaseLineItems(payload: CreateOrChangePurchaseLineItemsDTO): Promise<PurchaseLineItem[]>;
    getPurchaseLineItem(id: string): Promise<PurchaseLineItem | null>;
    getPurchaseLineItemsForPurchase(purchaseId: string): Promise<PurchaseLineItem[]>;
    updatePurchaseLineItemCategory(id: string, category: string, removeCategory: boolean): Promise<PurchaseLineItem>;
    updatePurchaseLineItemType(id: string, type: PurchaseLineItemType): Promise<PurchaseLineItem>;
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

        // asserting not null b/c we include it in above
        return givenPurchase.lineItems!;
    }

    async updatePurchaseLineItemCategory(
        id: string,
        category: string,
        removeCategory: boolean
    ): Promise<PurchaseLineItem> {
        const qb = this.db.createQueryBuilder().update(PurchaseLineItem);

        if (removeCategory) {
            qb.set({ category: null }).where("id = :id AND category = :category", { id, category });
        } else {
            qb.set({ category }).where("id = :id", { id });
        }

        const response = await qb.returning("*").execute();

        if (!response) {
            throw Boom.notFound("Error updating the purchase line item category");
        }
        return response.raw[0];
    }

    async updatePurchaseLineItemType(id: string, type: PurchaseLineItemType): Promise<PurchaseLineItem> {
        const response = await this.db
            .createQueryBuilder()
            .update(PurchaseLineItem)
            .set({ type: type })
            .where({ id })
            .returning("*")
            .execute();

        if (!response || response.affected === 0) {
            throw Boom.notFound("Error updating the purchase line item type");
        }

        return response.raw[0];
    }
}
